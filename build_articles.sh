SECONDS=0

printf "\nBuilding...\n"

printf '\n\n---------- Creating separate YAML files from data ----------\n\n'

echo '==== build ==== articles_from_yaml'
node ./helpers/articles_from_yaml.js -t 5350

echo '==== build ==== ENTU SSG'
node ./node_modules/entu-ssg/src/build.js ./config.yaml full

echo '==== build ==== reset_config_path_aliases'
node ./helpers/reset_config_path_aliases.js

duration=$SECONDS
minutes=$((duration/60))
seconds=$((duration%60))
printf "\n\nBUILD FINISHED IN $minutes m $seconds s.\n\n"