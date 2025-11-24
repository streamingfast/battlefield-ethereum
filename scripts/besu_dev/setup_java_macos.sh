#!/usr/bin/env bash

# Setup Java 21 for macOS Besu development
# This script helps manage Java versions on macOS

set -e

main() {
  echo "Setting up Java 21 for Besu development on macOS"

  # Check if Homebrew is installed
  if ! command -v brew &> /dev/null; then
    echo "Error: Homebrew is required. Install it from https://brew.sh/"
    exit 1
  fi

  # Install OpenJDK 21 if not already installed
  if ! brew list openjdk@21 &> /dev/null; then
    echo "Installing OpenJDK 21..."
    brew install openjdk@21
  else
    echo "OpenJDK 21 is already installed"
  fi

  # Add to PATH for current session
  export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"

  # Verify Java version
  echo "Verifying Java version..."
  java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
  if [[ "$java_version" == "21" ]]; then
    echo "✅ Java 21 is now active"
    java -version
  else
    echo "❌ Java 21 is not active (found Java $java_version)"
    echo ""
    echo "Add the following to your shell profile (.bashrc, .zshrc, etc.):"
    echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"'
    echo ""
    echo "Or run this command in your current session:"
    echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"'
    exit 1
  fi

  echo ""
  echo "You can now run:"
  echo "./scripts/besu_dev/build_besu.sh"
}

usage() {
  echo "Usage: $0"
  echo ""
  echo "Sets up Java 21 for Besu development on macOS"
  echo "Installs OpenJDK 21 via Homebrew and configures PATH"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    usage
    exit 0
  fi
  main "$@"
fi
