const { lstatSync } = require("fs")

module.exports = {
  "**/*": (files) => {
    const nonSymlinks = files.filter((f) => !lstatSync(f).isSymbolicLink())
    if (nonSymlinks.length === 0) return []
    return [`prettier --write --ignore-unknown ${nonSymlinks.map((f) => `"${f}"`).join(" ")}`]
  },
}
