import child_process from "child_process"
import path from "path"

type SpawnOptionsWithoutEnv = Omit<child_process.SpawnOptions, "env">

async function launchProcess(
  cwd: string,
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = {},
  options: SpawnOptionsWithoutEnv = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = child_process.spawn(command, args, {
      stdio: "inherit",
      cwd,
      env: {
        ...process.env,
        ...env,
      },
      ...options,
    })

    child.on("error", (err: Error) => {
      reject(err)
    })

    child.on("exit", (code: number) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
  })
}

export async function launchGethDev(): Promise<void> {
  console.log(getProjectRoot())
  await launchProcess(getProjectRoot(), "bash", ["scripts/run_firehose_geth_dev.sh", "3.0"])
}

function getProjectRoot(): string {
  return path.resolve(__dirname, "..")
}
