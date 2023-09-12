package main

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/streamingfast/cli"
	. "github.com/streamingfast/cli"
	"github.com/streamingfast/firehose-ethereum/codec"
	"github.com/streamingfast/firehose-ethereum/tools"
	"github.com/streamingfast/firehose-ethereum/types"
	pbeth "github.com/streamingfast/firehose-ethereum/types/pb/sf/ethereum/type/v2"
	"github.com/streamingfast/jsonpb"
	"github.com/streamingfast/logging"
	"go.uber.org/zap"
	"golang.org/x/exp/slices"
	"google.golang.org/protobuf/proto"
)

var zlog, _ = logging.PackageLogger("battlefield", "github.com/streamingfast/battlefield-ethereum")

func init() {
	logging.InstantiateLoggers()
}

func main() {
	Run("battlefield", "Battlefield binary",
		Command(generateE,
			"generate <oracle_data_dir>",
			"From the oracle Firehose log file, generate the oracle Firehose blocks",
			ExactArgs(1),
		),
		Command(compareE,
			"compare <oracle_data_dir> <syncer_firehose_log>",
			"From a new actual Firehose log file, generate the actual Firehose blocks and compare them against the current oracle Firehose blocks",
			ExactArgs(2),
			Description(`
				Runs Firehose Console Reader against <syncer_firehose_log> argument and turns it into
				an array of *pbeth.Block. It then compares that to the Oracle's array of pbeth.Block
				that is stored in '<oracle_data_dir>/oracle.json' file.

				If there is a diff between the two, a diff viewer is invoked. If the 'DIFF_EDITOR' is set,
				it is use with '$DIFF_EDITOR <oracle_json> <syncer_json>'. If 'DIFF_EDITOR' is **not** set, the command
				'bash -c diff -C 5 <oracle_json> <syncer_json>'.
			`),
		),
		OnCommandErrorLogAndExit(zlog),
	)
}

func generateE(cmd *cobra.Command, args []string) error {
	oracleDataDir := args[0]

	oracleFirehoseLogFile := filepath.Join(oracleDataDir, "oracle.firelog")

	oracleBlocks := readBlocks(oracleFirehoseLogFile)
	zlog.Info("read all oracle blocks from Firehose log file", zap.Int("block_count", len(oracleBlocks)), zap.String("file", oracleFirehoseLogFile))

	writeBlocks(oracleBlocks)

	fmt.Println("done")
	return nil
}

func compareE(_ *cobra.Command, args []string) error {
	oracleDataDir := args[0]
	actualFirehoseLogFile := args[1]

	oracleFirehoseLogFile := filepath.Join(oracleDataDir, "oracle.firelog")
	oracleBlocks := readBlocks(oracleFirehoseLogFile)
	zlog.Info("read all oracle blocks from Firehose log file", zap.Int("block_count", len(oracleBlocks)), zap.String("file", oracleFirehoseLogFile))

	actualBlocks := readBlocks(actualFirehoseLogFile)
	zlog.Info("read all actual blocks from Firehose log file", zap.Int("block_count", len(actualBlocks)), zap.String("file", actualFirehoseLogFile))

	writeBlocks(actualBlocks)

	zlog.Info("blocks read, now comparing with reference")
	hasDifferences := false
	if len(oracleBlocks) != len(actualBlocks) {
		fmt.Printf("Oracle and actual blocks count differs, oracle has %d blocks, actual has %d blocks\n", len(oracleBlocks), len(actualBlocks))
		hasDifferences = true
	}

	upToBlock := uint64(math.Min(float64(len(oracleBlocks)), float64(len(actualBlocks))))
	for i := uint64(0); i < upToBlock; i++ {
		oracle := oracleBlocks[i]
		actual := actualBlocks[i]

		isEqual, _ := tools.Compare(oracle.Block, actual.Block, false)

		if !isEqual {
			hasDifferences = true

			command := fmt.Sprintf("diff -C 5 \"%s\" \"%s\" | less", oracle.JSONFile, actual.JSONFile)
			if os.Getenv("DIFF_EDITOR") != "" {
				command = fmt.Sprintf("%s \"%s\" \"%s\"", os.Getenv("DIFF_EDITOR"), oracle.JSONFile, actual.JSONFile)
			}

			showDiff, _ := cli.PromptConfirm(fmt.Sprintf(`Block %s between oracle and actual differs, do you want to see the difference now`, oracle.Block.AsRef()))
			if showDiff {
				diffCmd := exec.Command("bash", "-c", command)

				diffCmd.Stdout = os.Stdout
				diffCmd.Stderr = os.Stderr

				cli.NoError(diffCmd.Run(), "Diff command failed to run properly")
			} else {
				fmt.Println("You can run the following command to see it manually later:")
				fmt.Println()
				fmt.Println(command)
			}
		}
	}

	topBlock := uint64(math.Max(float64(len(oracleBlocks)), float64(len(actualBlocks))))
	for i := upToBlock; i < topBlock; i++ {
		if i >= uint64(len(oracleBlocks)) {
			fmt.Printf("Actual has block #%d, oracle does not\n", i)
			continue
		}

		if i >= uint64(len(actualBlocks)) {
			fmt.Printf("Oracle has block %d, actual does not\n", i)
			continue
		}
	}

	if hasDifferences {
		return errors.New("failed")
	}

	fmt.Println("All blocks are equals!")
	return nil
}

func writeBlocks(blocks []*BlockWrapper) {
	zlog.Info("blocks read, now splitting them into individual files")
	slices.SortFunc(blocks, func(a, b *BlockWrapper) bool {
		return a.Block.Number < b.Block.Number
	})

	for _, block := range blocks {
		data, err := proto.Marshal(block.Block)
		cli.NoError(err, "Encoding block %q failed", block.Block.AsRef())

		err = os.WriteFile(block.ProtoFile, data, os.ModePerm)
		cli.NoError(err, "Writing block %q to %q failed", block.Block.AsRef(), block.ProtoFile)

		err = ioutil.WriteFile(block.JSONFile, toJSON(block.Block), os.ModePerm)
		cli.NoError(err, "Writing block %q to %q failed", block.Block.AsRef(), block.JSONFile)
	}
}

func toJSON(block *pbeth.Block) []byte {
	// Works only for top-level message it seems, seems like a shallow dynamic parsing
	// msg, err := dynamic.AsDynamicMessage(block)
	// cli.NoError(err, "Unable to load message for block %q", block.AsRef())

	// out, err := msg.MarshalJSONPB(&jsonpb.Marshaler{EmitDefaults: true, Indent: "  "})
	// cli.NoError(err, "Unable to marshal message for block %q", block.AsRef())

	out, err := jsonpb.MarshalIndentToString(block, "  ")
	cli.NoError(err, "Unable to marshal message for block %q", block.AsRef())

	return []byte(out)
}

type BlockWrapper struct {
	Block     *pbeth.Block
	ProtoFile string
	JSONFile  string
}

func readBlocks(firelogPath string) []*BlockWrapper {
	blocks := []*BlockWrapper{}

	firelogDir := filepath.Dir(firelogPath)
	firelogBase := filepath.Base(firelogPath)
	firelogTag := firelogBase[:len(firelogBase)-len(filepath.Ext(firelogBase))]

	file, err := os.Open(firelogPath)
	cli.NoError(err, "Unable to open blocks file %q", firelogPath)
	defer file.Close()

	reader, err := codec.NewConsoleReader(zlog, make(chan string, 10000))
	cli.NoError(err, "Unable to create console reader for blocks file %q", firelogPath)
	defer reader.Close()

	go reader.ProcessData(file)

	var lastBlockRead *pbeth.Block
	for {
		bsblk, err := reader.ReadBlock()
		if bsblk != nil {
			el, err := types.BlockDecoder(bsblk)
			cli.NoError(err, "cannot decode bstream block to native protocol block")
			if el != nil && el.(*pbeth.Block) != nil {
				block, ok := el.(*pbeth.Block)
				cli.Ensure(ok, `Read block is not a "pbeth.Block" but should have been`)

				lastBlockRead = sanitizeBlock(block)

				blocks = append(blocks, &BlockWrapper{
					Block:     lastBlockRead,
					ProtoFile: filepath.Join(firelogDir, fmt.Sprintf("%s.%d.binpb", firelogTag, block.Number)),
					JSONFile:  filepath.Join(firelogDir, fmt.Sprintf("%s.%d.json", firelogTag, block.Number)),
				})
			}
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			if lastBlockRead == nil {
				cli.NoError(err, "Unable to read first block from file %q", firelogPath)
			} else {
				cli.NoError(err, "Unable to read block from file %q, last block read was %s", lastBlockRead.AsRef())
			}
		}
	}

	return blocks
}

func sanitizeBlock(block *pbeth.Block) *pbeth.Block {
	for _, trxTrace := range block.TransactionTraces {
		for _, call := range trxTrace.Calls {
			if call.FailureReason != "" {
				call.FailureReason = "(varying field)"
			}
		}
	}

	// FIXME: This is temporary until we fix the issue in the Firehose directly, for
	// now compare without so that diff can go out cleanly.
	// block = clearOutOrdinalAndGasChanges(block)

	return block
}

func clearOutOrdinalAndGasChanges(block *pbeth.Block) *pbeth.Block {
	for _, change := range block.BalanceChanges {
		change.Ordinal = 0
	}

	for _, change := range block.CodeChanges {
		change.Ordinal = 0
	}

	for _, trxTrace := range block.TransactionTraces {
		trxTrace.BeginOrdinal = 0
		trxTrace.EndOrdinal = 0

		for _, log := range trxTrace.Receipt.Logs {
			log.Ordinal = 0
		}

		for _, call := range trxTrace.Calls {
			call.BeginOrdinal = 0
			call.EndOrdinal = 0

			// call.GasChanges = nil

			for _, creation := range call.AccountCreations {
				creation.Ordinal = 0
			}

			for _, log := range call.Logs {
				log.Ordinal = 0
			}

			for _, change := range call.BalanceChanges {
				change.Ordinal = 0
			}

			for _, change := range call.GasChanges {
				change.Ordinal = 0
			}

			for _, change := range call.NonceChanges {
				change.Ordinal = 0
			}

			for _, change := range call.StorageChanges {
				change.Ordinal = 0
			}

			for _, change := range call.CodeChanges {
				change.Ordinal = 0
			}
		}
	}

	return block
}

type gasChangeView pbeth.GasChange

func (g *gasChangeView) String() string {
	return fmt.Sprintf("%d => %d (%s @ %d)", g.OldValue, g.NewValue, g.Reason, g.Ordinal)
}
