#!/bin/bash
# Generate remaining character poses using GitHub Actions workflow
# Usage: ./generate_poses.sh <GITHUB_TOKEN>

TOKEN="$1"
REPO="KanW123/github100projecttest"
REFERENCE_IMAGE="ImageGenerator/generated/2026-01-21/img_20260121_113256.png"

if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <GITHUB_TOKEN>"
    exit 1
fi

# Function to trigger workflow
trigger_workflow() {
    local prompt="$1"
    local use_reference="$2"

    echo "Triggering: $prompt"

    if [ "$use_reference" = "true" ]; then
        curl -s -X POST \
            -H "Authorization: token $TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/$REPO/actions/workflows/generate-image.yml/dispatches" \
            -d "{\"ref\":\"main\",\"inputs\":{\"prompt\":\"$prompt\",\"provider\":\"openai\",\"reference_image\":\"$REFERENCE_IMAGE\",\"input_fidelity\":\"high\"}}"
    else
        curl -s -X POST \
            -H "Authorization: token $TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/$REPO/actions/workflows/generate-image.yml/dispatches" \
            -d "{\"ref\":\"main\",\"inputs\":{\"prompt\":\"$prompt\",\"provider\":\"openai\",\"reference_image\":\"\"}}"
    fi

    echo " - Triggered!"
    sleep 3  # Small delay between triggers
}

echo "Generating remaining poses..."
echo "Reference image: $REFERENCE_IMAGE"
echo ""

# Kick pose
trigger_workflow "This character doing high kick pose, same outfit red/white martial arts, side view facing right, full body, white background, 2D fighting game sprite" "true"

echo "Waiting 60s before next pose..."
sleep 60

# Block pose
trigger_workflow "This character in defensive block pose arms crossed, same outfit red/white martial arts, side view facing right, full body, white background, 2D fighting game sprite" "true"

echo "Waiting 60s before next pose..."
sleep 60

# Hurt pose
trigger_workflow "This character recoiling from hit knocked back pose, same outfit red/white martial arts, side view facing right, full body, white background, 2D fighting game sprite" "true"

echo "Waiting 60s before next pose..."
sleep 60

# Win pose
trigger_workflow "This character in victory pose fist raised celebrating, same outfit red/white martial arts, side view facing right, full body, white background, 2D fighting game sprite" "true"

echo ""
echo "All poses triggered! Check workflow status with:"
echo "curl -s -H \"Authorization: token \$TOKEN\" \"https://api.github.com/repos/$REPO/actions/runs?per_page=5\""
