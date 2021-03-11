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

	"github.com/dfuse-io/dfuse-ethereum/codec"
	pbcodec "github.com/dfuse-io/dfuse-ethereum/pb/dfuse/ethereum/codec/v1"
	"github.com/dfuse-io/jsonpb"
	"github.com/dfuse-io/logging"
	"github.com/golang/protobuf/ptypes"
	pbts "github.com/golang/protobuf/ptypes/timestamp"
	"github.com/lithammer/dedent"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
	"golang.org/x/crypto/ssh/terminal"
)

var rootCmd = &cobra.Command{Use: "battlefield", Short: "Battlefield binary"}
var generateCmd = &cobra.Command{Use: "generate", Short: "From the oracle deep mind log file, generate the oracle dfuse blocks", RunE: generateE}
var compareCmd = &cobra.Command{
	Use:   "compare <syncer_deepmind_log> [<file_dir>]",
	Short: "From a new actual deep mind log file, generate the actual dfuse blocks and compare them against the current oracle dfuse blocks",
	RunE:  compareE,
}

var fixedTimestamp *pbts.Timestamp
var zlog = zap.NewNop()

func init() {
	logging.TestingOverride()

	fixedTime, _ := time.Parse(time.RFC3339, "2006-01-02T15:04:05Z")
	fixedTimestamp, _ = ptypes.TimestampProto(fixedTime)
}

func main() {
	rootCmd.SilenceErrors = true
	rootCmd.SilenceUsage = true

	rootCmd.AddCommand(generateCmd)
	rootCmd.AddCommand(compareCmd)

	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func generateE(cmd *cobra.Command, args []string) error {
	currentDir, err := os.Getwd()
	noError(err, "unable to get working directory")

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
	noError(err, "unable to get working directory")

	actualDmlogFile := args[0]
	actualJSONFile := strings.ReplaceAll(actualDmlogFile, ".dmlog", ".json")
	oracleDmlogFile := filepath.Join(currentDir, "run", "data", "oracle", "oracle.dmlog")
	oracleJSONFile := filepath.Join(currentDir, "run", "data", "oracle", "oracle.json")

	actualBlocks := readActualBlocks(actualDmlogFile)
	zlog.Info("read all blocks from dmlog file", zap.Int("block_count", len(actualBlocks)), zap.String("file", actualDmlogFile))

	writeActualBlocks(actualJSONFile, actualBlocks)

	zlog.Info("blocks read, now comparing with reference")
	if jsonEq(oracleJSONFile, actualJSONFile) {
		fmt.Println("Files are equal, all good")
		os.Exit(0)
	}

	diffCmd := exec.Command("bash", "-c", fmt.Sprintf("diff -C 5 %s %s | less", oracleJSONFile, actualJSONFile))

	showDiff, wasAnswered := askQuestion(`File %q and %q differs, do you want to see the difference now`, oracleJSONFile, actualJSONFile)
	if wasAnswered && showDiff {
		diffCmd.Stdout = os.Stdout
		diffCmd.Stderr = os.Stderr

		noError(diffCmd.Run(), "Diff command failed to run properly")
	} else {
		fmt.Println("Not showing diff between files, run the following command to see it manually:")
		fmt.Println()
		fmt.Printf("    %s\n", makeSingleLineDiffCmd(diffCmd))
		fmt.Println("")
	}

	acceptDiff, wasAnswered := askQuestion(`Do you want to accept %q as the new %q right now`, actualJSONFile, oracleJSONFile)
	if wasAnswered && acceptDiff {
		copyFile(actualJSONFile, oracleJSONFile)
		copyFile(actualDmlogFile, oracleDmlogFile)

		fmt.Printf("The file %q (and its '.dmlog' sibling) is now the new active oracle data\n", actualJSONFile)
		return nil
	}

	fmt.Printf("You can make actual file %q the new oracle file manually by doing:\n", actualJSONFile)
	fmt.Println("")
	fmt.Printf("    cp %s %s\n", actualJSONFile, oracleJSONFile)
	fmt.Println("")

	return errors.New("failed")
}

func makeSingleLineDiffCmd(cmd *exec.Cmd) (out string) {
	out = cmd.String()
	out = strings.Replace(out, "diff -C", `"diff -C`, 1)
	out = strings.Replace(out, "| less", `| less"`, 1)
	out = strings.Replace(out, "\n", ", ", -1)

	return
}

func writeActualBlocks(actualFile string, blocks []*pbcodec.Block) {
	buffer := bytes.NewBuffer(nil)
	_, err := buffer.WriteString("[\n")
	noError(err, "Unable to write list start")

	blockCount := len(blocks)
	if blockCount > 0 {
		lastIndex := blockCount - 1
		for i, block := range blocks {
			out, err := jsonpb.MarshalIndentToString(block, "  ")
			noError(err, "Unable to marshal block %q", block.AsRef())

			_, err = buffer.WriteString(out)
			noError(err, "Unable to write block %q", block.AsRef())

			if i != lastIndex {
				_, err = buffer.WriteString(",\n")
				noError(err, "Unable to write block delimiter %q", block.AsRef())
			}
		}
	}

	_, err = buffer.WriteString("]\n")
	noError(err, "Unable to write list end")

	var unormalizedStruct []interface{}
	err = json.Unmarshal(buffer.Bytes(), &unormalizedStruct)
	noError(err, "Unable to unmarshal JSON for normalization")

	normalizedJSON, err := json.MarshalIndent(unormalizedStruct, "", "  ")
	noError(err, "Unable to normalize JSON")

	err = ioutil.WriteFile(actualFile, normalizedJSON, os.ModePerm)
	noError(err, "Unable to write file %q", actualFile)
}

func readActualBlocks(filePath string) []*pbcodec.Block {
	blocks := []*pbcodec.Block{}

	file, err := os.Open(filePath)
	noError(err, "Unable to open actual blocks file %q", filePath)
	defer file.Close()

	reader, err := codec.NewConsoleReader(file)
	noError(err, "Unable to create console reader for actual blocks file %q", filePath)
	defer reader.Close()

	var lastBlockRead *pbcodec.Block
	for {
		el, err := reader.Read()
		if el != nil && el.(*pbcodec.Block) != nil {
			block, ok := el.(*pbcodec.Block)
			ensure(ok, `Read block is not a "pbcodec.Block" but should have been`)

			lastBlockRead = sanitizeBlock(block)
			blocks = append(blocks, lastBlockRead)
		}

		if err == io.EOF {
			break
		}

		if err != nil {
			if lastBlockRead == nil {
				noError(err, "Unable to read first block from file %q", filePath)
			} else {
				noError(err, "Unable to read block from file %q, last block read was %s", lastBlockRead.AsRef())
			}
		}
	}

	return blocks
}

func sanitizeBlock(block *pbcodec.Block) *pbcodec.Block {
	for _, trxTrace := range block.TransactionTraces {
		for _, call := range trxTrace.Calls {
			if strings.HasPrefix(call.FailureReason, "evm: ") {
				call.FailureReason = strings.TrimPrefix(call.FailureReason, "evm: ")
			}
		}
	}

	return block
}

func jsonEq(oracleFile string, actualFile string) bool {
	oracle, err := ioutil.ReadFile(oracleFile)
	noError(err, "Unable to read %q", oracleFile)

	actual, err := ioutil.ReadFile(actualFile)
	noError(err, "Unable to read %q", actualFile)

	var oracleJSONAsInterface, actualJSONAsInterface interface{}

	err = json.Unmarshal(oracle, &oracleJSONAsInterface)
	noError(err, "Oracle file %q is not a valid JSON file", oracleFile)

	err = json.Unmarshal(actual, &actualJSONAsInterface)
	noError(err, "Actual file %q is not a valid JSON file", actualFile)

	return assert.ObjectsAreEqualValues(oracleJSONAsInterface, actualJSONAsInterface)
}

func askQuestion(label string, args ...interface{}) (answeredYes bool, wasAnswered bool) {
	if !terminal.IsTerminal(int(os.Stdout.Fd())) {
		zlog.Info("stdout is not a terminal, assuming no default")
		wasAnswered = false
		return
	}

	prompt := promptui.Prompt{
		Label:     dedent.Dedent(fmt.Sprintf(label, args...)),
		IsConfirm: true,
	}

	result, err := prompt.Run()
	if err != nil {
		zlog.Info("unable to aks user to see diff right now, too bad", zap.Error(err))
		wasAnswered = false
		return
	}

	wasAnswered = true
	answeredYes = strings.ToLower(result) == "y" || strings.ToLower(result) == "yes"
	return
}

func copyFile(inPath, outPath string) {
	inFile, err := os.Open(inPath)
	noError(err, "Unable to open actual file %q", inPath)
	defer inFile.Close()

	outFile, err := os.Create(outPath)
	noError(err, "Unable to open expected file %q", outPath)
	defer outFile.Close()

	_, err = io.Copy(outFile, inFile)
	noError(err, "Unable to copy file %q to %q", inPath, outPath)
}

func fileExists(path string) bool {
	stat, err := os.Stat(path)
	if err != nil {
		// For this script, we don't care
		return false
	}

	return !stat.IsDir()
}

func ensure(condition bool, message string, args ...interface{}) {
	if !condition {
		quit(message, args...)
	}
}

func noError(err error, message string, args ...interface{}) {
	if err != nil {
		quit(message+": "+err.Error(), args...)
	}
}

func quit(message string, args ...interface{}) {
	fmt.Printf(message+"\n", args...)
	os.Exit(1)
}
