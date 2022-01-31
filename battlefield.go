package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes"
	pbts "github.com/golang/protobuf/ptypes/timestamp"
	"github.com/google/go-cmp/cmp"
	"github.com/spf13/cobra"
	"github.com/streamingfast/battlefield-ethereum/cli"
	"github.com/streamingfast/jsonpb"
	"github.com/streamingfast/logging"
	"github.com/streamingfast/sf-ethereum/codec"
	pbcodec "github.com/streamingfast/sf-ethereum/pb/sf/ethereum/codec/v1"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

var fixedTimestamp *pbts.Timestamp
var zlog = zap.NewNop()

func init() {
	logging.TestingOverride()

	fixedTime, _ := time.Parse(time.RFC3339, "2006-01-02T15:04:05Z")
	fixedTimestamp, _ = ptypes.TimestampProto(fixedTime)
}

func main() {
	Run("battlefield", "Battlefield binary",
		Command(generateE,
			"generate",
			"From the oracle deep mind log file, generate the oracle dfuse blocks",
		),
		Command(compareE,
			"compare <syncer_deepmind_log>",
			"From a new actual deep mind log file, generate the actual dfuse blocks and compare them against the current oracle dfuse blocks",
			Description(`
				Runs dfuse Console Reader against <syncer_deepmind_log> argument and turns it into
				an array of *pbcodec.Block. It then compares that to the Oracle's array of pbcodec.Block
				that is stored in 'run/data/oracle/oracle.json' file.

				If there is a diff between the two, a diff viewer is invoked. If the 'DIFF_EDITOR' is set,
				it is use with '$DIFF_EDITOR <oracle_json> <syncer_json>'. If 'DIFF_EDITOR' is **not** set, the command
				'bash -c diff -C 5 <oracle_json> <syncer_json>'.
			`),
		),
	)
}

func generateE(cmd *cobra.Command, args []string) error {
	currentDir, err := os.Getwd()
	cli.NoError(err, "unable to get working directory")

	oracleDmlogFile := filepath.Join(currentDir, "run", "data", "oracle", "oracle.dmlog")
	oracleJSONFile := filepath.Join(currentDir, "run", "data", "oracle", "oracle.json")

	oracleBlocks := readActualBlocks(oracleDmlogFile)
	zlog.Info("read all blocks from dmlog file", zap.Int("block_count", len(oracleBlocks)), zap.String("file", oracleDmlogFile))

	fmt.Printf("Writing oracle blocks to disk...")
	writeActualBlocks(oracleJSONFile, oracleBlocks)

	fmt.Println(" done")
	return nil
}

func compareE(cmd *cobra.Command, args []string) error {
	currentDir, err := os.Getwd()
	cli.NoError(err, "unable to get working directory")

	actualDmlogFile := args[0]
	actualJSONFile := strings.ReplaceAll(actualDmlogFile, ".dmlog", ".json")
	oracleDmlogFile := filepath.Join(currentDir, "run", "data", "oracle", "oracle.dmlog")
	oracleJSONFile := filepath.Join(currentDir, "run", "data", "oracle", "oracle.json")

	actualBlocks := readActualBlocks(actualDmlogFile)
	zlog.Info("read all blocks from dmlog file", zap.Int("block_count", len(actualBlocks)), zap.String("file", actualDmlogFile))

	writeActualBlocks(actualJSONFile, actualBlocks)

	zlog.Info("blocks read, now comparing with reference")

	if isSameBlocks(oracleJSONFile, actualJSONFile) {
		fmt.Println("Files are equal, all good")
		os.Exit(0)
	}

	useBash := true
	command := fmt.Sprintf("diff -C 5 \"%s\" \"%s\" | less", oracleJSONFile, actualJSONFile)
	if os.Getenv("DIFF_EDITOR") != "" {
		command = fmt.Sprintf("%s \"%s\" \"%s\"", os.Getenv("DIFF_EDITOR"), oracleJSONFile, actualJSONFile)
	}

	showDiff, wasAnswered := cli.AskConfirmation(`File %q and %q differs, do you want to see the difference now`, oracleJSONFile, actualJSONFile)
	if wasAnswered && showDiff {
		diffCmd := exec.Command(command)
		if useBash {
			diffCmd = exec.Command("bash", "-c", command)
		}

		diffCmd.Stdout = os.Stdout
		diffCmd.Stderr = os.Stderr

		cli.NoError(diffCmd.Run(), "Diff command failed to run properly")

		fmt.Println("You can run the following command to see it manually later:")
	} else {
		fmt.Println("Not showing diff between files, run the following command to see it manually:")
	}

	fmt.Println()
	fmt.Printf("    %s\n", command)
	fmt.Println("")

	acceptDiff, wasAnswered := cli.AskConfirmation(`Do you want to accept %q as the new %q right now`, actualJSONFile, oracleJSONFile)
	if wasAnswered && acceptDiff {
		cli.CopyFile(actualJSONFile, oracleJSONFile)
		cli.CopyFile(actualDmlogFile, oracleDmlogFile)

		fmt.Printf("The file %q (and its '.dmlog' sibling) is now the new active oracle data\n", actualJSONFile)
		return nil
	}

	fmt.Printf("You can make actual file %q the new oracle file manually by doing:\n", actualJSONFile)
	fmt.Println("")
	fmt.Printf("    cp %s %s\n", actualJSONFile, oracleJSONFile)
	fmt.Println("")

	return errors.New("failed")
}

func writeActualBlocks(actualFile string, blocks []*pbcodec.Block) {
	buffer := bytes.NewBuffer(nil)
	_, err := buffer.WriteString("[\n")
	cli.NoError(err, "Unable to write list start")

	blockCount := len(blocks)
	if blockCount > 0 {
		lastIndex := blockCount - 1
		for i, block := range blocks {
			out, err := jsonpb.MarshalIndentToString(block, "  ")
			cli.NoError(err, "Unable to marshal block %q", block.AsRef())

			_, err = buffer.WriteString(out)
			cli.NoError(err, "Unable to write block %q", block.AsRef())

			if i != lastIndex {
				_, err = buffer.WriteString(",\n")
				cli.NoError(err, "Unable to write block delimiter %q", block.AsRef())
			}
		}
	}

	_, err = buffer.WriteString("]\n")
	cli.NoError(err, "Unable to write list end")

	var unormalizedStruct []interface{}
	err = json.Unmarshal(buffer.Bytes(), &unormalizedStruct)
	cli.NoError(err, "Unable to unmarshal JSON for normalization")

	normalizedJSON, err := json.MarshalIndent(unormalizedStruct, "", "  ")
	cli.NoError(err, "Unable to normalize JSON")

	err = ioutil.WriteFile(actualFile, normalizedJSON, os.ModePerm)
	cli.NoError(err, "Unable to write file %q", actualFile)
}

func readActualBlocks(filePath string) []*pbcodec.Block {
	blocks := []*pbcodec.Block{}

	file, err := os.Open(filePath)
	cli.NoError(err, "Unable to open actual blocks file %q", filePath)
	defer file.Close()

	reader, err := codec.NewConsoleReader(make(chan string, 10000))
	cli.NoError(err, "Unable to create console reader for actual blocks file %q", filePath)
	defer reader.Close()

	go reader.ProcessData(file)

	var lastBlockRead *pbcodec.Block
	for {
		el, err := reader.Read()
		if el != nil && el.(*pbcodec.Block) != nil {
			block, ok := el.(*pbcodec.Block)
			cli.Ensure(ok, `Read block is not a "pbcodec.Block" but should have been`)

			lastBlockRead = sanitizeBlock(block)
			blocks = append(blocks, lastBlockRead)
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			if lastBlockRead == nil {
				cli.NoError(err, "Unable to read first block from file %q", filePath)
			} else {
				cli.NoError(err, "Unable to read block from file %q, last block read was %s", lastBlockRead.AsRef())
			}
		}
	}

	return blocks
}

func sanitizeBlock(block *pbcodec.Block) *pbcodec.Block {
	for _, trxTrace := range block.TransactionTraces {
		for _, call := range trxTrace.Calls {
			if call.FailureReason != "" {
				call.FailureReason = "(varying field)"
			}
		}
	}

	return block
}

func isSameBlocks(oracleFile string, actualFile string) bool {
	oracle, err := ioutil.ReadFile(oracleFile)
	cli.NoError(err, "Unable to read %q", oracleFile)

	actual, err := ioutil.ReadFile(actualFile)
	cli.NoError(err, "Unable to read %q", actualFile)

	var oracleJSONAsInterface, actualJSONAsInterface interface{}

	err = json.Unmarshal(oracle, &oracleJSONAsInterface)
	cli.NoError(err, "Oracle file %q is not a valid JSON file", oracleFile)

	err = json.Unmarshal(actual, &actualJSONAsInterface)
	cli.NoError(err, "Actual file %q is not a valid JSON file", actualFile)

	return assert.ObjectsAreEqualValues(oracleJSONAsInterface, actualJSONAsInterface)
}

func diff() {

}

type DiffReporter struct {
	path  cmp.Path
	diffs []string
}

func (r *DiffReporter) PushStep(ps cmp.PathStep) {
	r.path = append(r.path, ps)
}

func (r *DiffReporter) Report(rs cmp.Result) {
	if !rs.Equal() {
		vx, vy := r.path.Last().Values()
		r.diffs = append(r.diffs, fmt.Sprintf("%#v:\n\t-: %+v\n\t+: %+v\n", r.path, vx, vy))
	}
}

func (r *DiffReporter) PopStep() {
	r.path = r.path[:len(r.path)-1]
}

func (r *DiffReporter) String() string {
	return strings.Join(r.diffs, "\n")
}

var Run = cli.Run
var Command = cli.Command

type Description = cli.Description
