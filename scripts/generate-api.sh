#!/bin/bash
set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
SPEC_FILE="../shared/openapi.yaml"

echo "Fetching OpenAPI spec from backend ($BACKEND_URL)..."
curl -sf "$BACKEND_URL/v3/api-docs.yaml" -o "$SPEC_FILE"

echo "Generating API client..."
npx openapi-typescript-codegen \
  --input "$SPEC_FILE" \
  --output ../frontend/src/api \
  --client axios \
  --useOptions \
  --useUnionTypes

echo "Done. Spec saved to shared/openapi.yaml, client written to frontend/src/api/"
