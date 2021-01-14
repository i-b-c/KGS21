SECONDS=0
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
echo $PWD

printf "\nBuilding...\n"

printf '\n\n---------- Creating separate YAML files from data ----------\n\n'

echo '==== build ==== contact_persons_from_yaml'
node ./helpers/contact_persons_from_yaml.js -t

echo '==== build ==== ENTU SSG'
node ./node_modules/entu-ssg/src/build.js ./config.yaml full

echo '==== build ==== reset_config_path_aliases'
node ./helpers/reset_config_path_aliases.js -t

duration=$SECONDS
minutes=$((duration/60))
seconds=$((duration%60))
printf "\n\nBUILD FINISHED IN $minutes m $seconds s.\n\n"

