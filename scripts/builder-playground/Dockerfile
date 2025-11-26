# Dockerfile for Firehose Geth client
FROM golang:1.25.4-alpine AS builder

# Install git and build dependencies
RUN apk add --no-cache git make gcc musl-dev linux-headers

# Clone and build firehose geth
RUN git clone https://github.com/streamingfast/go-ethereum --branch firehose-fh3.0 --single-branch /go-ethereum && \
    cd /go-ethereum && \
    go install ./cmd/geth

# Runtime stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests and jq for JSON processing
RUN apk add --no-cache ca-certificates jq curl

# Copy the built geth binary from builder stage
COPY --from=builder /go/bin/geth /usr/local/bin/geth

# Create data directory
RUN mkdir -p /data

# Set working directory
WORKDIR /data

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose ports
EXPOSE 8545 8551 30303

# Default entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
