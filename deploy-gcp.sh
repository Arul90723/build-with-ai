#!/bin/bash

# Configuration
SERVICE_NAME="ai-research-assistant"
REGION="us-central1"

# Step 1: Ensure you are logged in
echo "Verifying Google Cloud authentication..."
gcloud auth list --filter=status:ACTIVE --format="value(account)"

# Step 2: Set your project ID (if not already set)
# gcloud config set project [YOUR_PROJECT_ID]

# Step 3: Deploy to Cloud Run using Cloud Build (no local Docker required)
echo "Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"

echo "Deployment complete! Your service will be available at the URL shown above."
echo "Don't forget to set your GEMINI_API_KEY in the Google Cloud Console for the service."
