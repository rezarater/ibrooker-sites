#!/bin/bash
# Run by cron on the host every 10 minutes: pull latest code and copy sites into place.
cd /home/ibrook/repositories/ibrooker-sites || exit 1
git pull -q origin main
/bin/cp -R com/. /home/ibrook/public_html/
/bin/cp -R ir/. /home/ibrook/ir.ibrooker.com/
