#!/usr/bin/env bash

set -e

# Build Besu from StreamingFast repository for battlefield testing
# This script clones and builds Besu from the StreamingFast fork
#
# Prerequisites:
# - Java 21 (required, Java 22+ is incompatible with Gradle 8.7)
# - Git (for cloning the repository)
# - The script uses the gradlew wrapper included in the Besu repository
#
# Java installation:
# - Ubuntu/Debian: sudo apt install openjdk-21-jdk
# - macOS: brew install openjdk@21 && export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
# - Windows: Download from https://adoptium.net/ (Temurin JDK 21)
#           Set JAVA_HOME environment variable to the JDK installation directory

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BESU_REPO_URL="${BESU_REPO_URL:-https://github.com/streamingfast/besu.git}"
BESU_BRANCH="${BESU_BRANCH:-main}"

main() {
  echo "Building Besu from StreamingFast repository for battlefield testing"
  echo "Repository: $BESU_REPO_URL"
  echo "Branch: $BESU_BRANCH"

  # Check if Java 21 is available
  if ! command -v java &> /dev/null; then
    echo "Error: Java 21 is required to build Besu"
    echo ""
    echo "Install Java 21:"
    echo "- Ubuntu/Debian: sudo apt install openjdk-21-jdk"
    echo "- macOS: brew install openjdk@21 && export PATH=\"/opt/homebrew/opt/openjdk@21/bin:\$PATH\""
    echo "- Windows: Download from https://adoptium.net/ (Temurin JDK 21)"
    echo ""
    echo "Note: Java 22+ is incompatible with Gradle 8.7, so Java 21 is required."
    exit 1
  fi

  # Check Java version
  java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
  if [[ "$java_version" != "21" ]]; then
    echo "Error: Java 21 is required (found Java $java_version)"
    echo ""
    echo "Install Java 21:"
    echo "- Ubuntu/Debian: sudo apt install openjdk-21-jdk"
    echo "- macOS: brew install openjdk@21 && export PATH=\"/opt/homebrew/opt/openjdk@21/bin:\$PATH\""
    echo "- Windows: Download from https://adoptium.net/ (Temurin JDK 21)"
    echo ""
    echo "Note: Java 22+ is incompatible with Gradle 8.7, so Java 21 is required."
    echo ""
    echo "If you have multiple Java versions, make sure Java 21 is first in PATH:"
    echo "export PATH=\"/opt/homebrew/opt/openjdk@21/bin:\$PATH\""
    exit 1
  fi

  # Create temporary build directory
  build_dir="$(mktemp -d)"
  echo "Using build directory: $build_dir"

  # Clone the repository
  echo "Cloning Besu repository..."
  git clone --depth 1 --branch "$BESU_BRANCH" "$BESU_REPO_URL" "$build_dir"

  cd "$build_dir"

  # Build Besu
  echo "Building Besu (this may take several minutes)..."
  if [[ -f "./gradlew" ]]; then
    ./gradlew installDist -x test
  else
    gradle installDist -x test
  fi

  # Check if build was successful
  if [[ ! -f "build/install/besu/bin/besu" ]] || [[ ! -d "build/install/besu/lib" ]]; then
    echo "Error: Besu distribution not found after build"
    echo "Build directory: $build_dir"
    echo "Expected files: build/install/besu/bin/besu and build/install/besu/lib/"
    exit 1
  fi

  # Copy the entire distribution to a standard location
  install_dir="$HOME/.battlefield-besu"

  # Clean up any existing installation
  if [[ -d "$install_dir" ]]; then
    echo "Removing existing Besu installation..."
    rm -rf "$install_dir"
  fi

  mkdir -p "$install_dir"

  echo "Installing Besu distribution to $install_dir"
  cp -r "build/install/besu/"* "$install_dir/"

  # Add to PATH if not already there
  if [[ ":$PATH:" != *":$install_dir/bin:"* ]]; then
    echo ""
    echo "Add the following to your shell profile (.bashrc, .zshrc, etc.):"
    echo "export PATH=\"$install_dir/bin:\$PATH\""
    echo ""
    echo "Or run this command to add it to your current session:"
    echo "export PATH=\"$install_dir/bin:\$PATH\""
  fi

  echo ""
  echo "Besu successfully built and installed!"
  echo "Binary location: $install_dir/bin/besu"
  echo "Version: $($install_dir/bin/besu --version 2>/dev/null || echo 'Unable to determine version')"

  # Clean up build directory
  echo "Cleaning up build directory..."
  rm -rf "$build_dir"
}

usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Build Besu from StreamingFast repository for battlefield testing"
  echo ""
  echo "Prerequisites:"
  echo "  - Java 21 (required, Java 22+ is incompatible with Gradle 8.7)"
  echo "  - Git (for cloning the repository)"
  echo "  - The script uses the gradlew wrapper included in the Besu repository"
  echo ""
  echo "Java installation:"
  echo "  - Ubuntu/Debian: sudo apt install openjdk-21-jdk"
  echo "  - macOS: brew install openjdk@21 && export PATH=\"/opt/homebrew/opt/openjdk@21/bin:\$PATH\""
  echo "  - Windows: Download from https://adoptium.net/ (Temurin JDK 21)"
  echo "            Set JAVA_HOME environment variable to the JDK installation directory"
  echo ""
  echo "Options:"
  echo "  --repo URL       Besu repository URL (default: https://github.com/streamingfast/besu.git)"
  echo "  --branch BRANCH  Branch to build (default: main)"
  echo "  --help           Show this help message"
  echo ""
  echo "Environment variables:"
  echo "  BESU_REPO_URL    Same as --repo"
  echo "  BESU_BRANCH      Same as --branch"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --repo)
      BESU_REPO_URL="$2"
      shift 2
      ;;
    --branch)
      BESU_BRANCH="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

main "$@"
