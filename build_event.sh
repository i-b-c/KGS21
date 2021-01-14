SECONDS=0
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
echo $PWD

printf "\nBuilding...\n"

printf '\n\n---------- Creating separate YAML files from data ----------\n\n'

echo '==== build ==== events_from_yaml'
node ./helpers/events_from_yaml.js -t $1

echo '==== build ==== performances_from_yaml'
node ./helpers/performances_from_yaml.js -t e $1

echo '==== build ==== projects_from_yaml'
node ./helpers/projects_from_yaml.js -t $1

echo '==== build ==== calendar_json.js'
node ./helpers/calendar_json.js

echo '==== build ==== ENTU SSG'
# node ./node_modules/entu-ssg/src/build.js ./config.yaml full

echo '==== build ==== reset_config_path_aliases'
node ./helpers/reset_config_path_aliases.js

duration=$SECONDS
minutes=$((duration/60))
seconds=$((duration%60))
printf "\n\nBUILD FINISHED IN $minutes m $seconds s.\n\n"