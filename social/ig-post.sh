#!/usr/bin/env bash
# Publish one image post to @sugarkrewegummies.
# Usage: social/ig-post.sh <post key from social/schedule.json> (image posts or type "reel")
# The Instagram token is NOT in this repo: the Claude cloud environment's
# proxy adds it to requests to graph.facebook.com.
set -euo pipefail
N="$1"
DIR="$(cd "$(dirname "$0")" && pwd)"
IG_ID=17841437657279393
API=https://graph.facebook.com/v21.0
AUTH="Authorization: Bearer proxy-injected"
field() { python3 -c "import json;print(json.load(open('$DIR/schedule.json'))['$N'].get('$1',''))"; }
TYPE=$(field type); IMAGE=$(field image); VIDEO=$(field video)
CAPTION=$(python3 -c "import json,sys;print(json.load(open('$DIR/schedule.json'))['$N']['caption'])")
jget() { python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('$1',''))" ; }

if [ "$TYPE" = reel ]; then
  curl -sf -o /dev/null "$VIDEO" || { echo "Video not reachable: $VIDEO"; exit 1; }
  RES=$(curl -s -X POST "$API/$IG_ID/media" -H "$AUTH" --data-urlencode "media_type=REELS" --data-urlencode "video_url=$VIDEO" --data-urlencode "share_to_feed=true" --data-urlencode "caption=$CAPTION")
else
  curl -sf -o /dev/null "$IMAGE" || { echo "Image not reachable: $IMAGE"; exit 1; }
  RES=$(curl -s -X POST "$API/$IG_ID/media" -H "$AUTH" --data-urlencode "image_url=$IMAGE" --data-urlencode "caption=$CAPTION")
fi
CID=$(echo "$RES" | jget id)
[ -n "$CID" ] || { echo "Create failed: $RES"; exit 1; }
for i in $(seq 1 90); do
  ST=$(curl -s "$API/$CID?fields=status_code" -H "$AUTH" | jget status_code)
  [ "$ST" = FINISHED ] && break
  [ "$ST" = ERROR ] && { echo "Processing error for container $CID"; exit 1; }
  sleep 5
done
PUB=$(curl -s -X POST "$API/$IG_ID/media_publish" -H "$AUTH" --data-urlencode "creation_id=$CID")
MID=$(echo "$PUB" | jget id)
[ -n "$MID" ] || { echo "Publish failed: $PUB"; exit 1; }
curl -s "$API/$MID?fields=permalink,timestamp" -H "$AUTH"; echo
