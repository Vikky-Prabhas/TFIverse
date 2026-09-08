#!/bin/bash
export NVM_DIR="/home/pepper-salt/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse-data-engine
python3 src/scrapers/bms_async.py >> /home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse/cron.log 2>&1
python3 src/scrapers/paytm_async.py >> /home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse/cron.log 2>&1
python3 src/scrapers/sacnilk.py >> /home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse/cron.log 2>&1

cd /home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse
npx tsx --env-file=.env.local scripts/sync-box-office.ts >> /home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse/cron.log 2>&1
