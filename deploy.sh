#! /bin/sh

SECONDS=0
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
echo $PWD

printf '\nMaking copy of live site\n'
cp -a /srv/www/. /srv/www-bak/`date +"%Y-%m-%d_%H-%M-%S"`/


printf '\nReplace live site\n'
rsync -avh /srv/ssg/build/. /srv/www/  --delete-after

