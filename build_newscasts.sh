SECONDS=0
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR
echo $PWD

printf "\nBuilding...\n"

# store arguments in a special array
args=("$@")
# get number of elements
ELEMENTS=${#args[@]}

# echo each element in array
# for loop
for (( i=0;i<$ELEMENTS;i++)); do
    echo ${args[${i}]}
done


printf '\n\n---------- Creating separate YAML files from data ----------\n\n'

echo '==== build ==== newscast_from_yaml'
node ./helpers/newscast_from_yaml.js -t

echo '==== build ==== ENTU SSG'
node ./node_modules/entu-ssg/src/build.js ./config.yaml full

echo '==== build ==== reset_config_path_aliases'
node ./helpers/reset_config_path_aliases.js

duration=$SECONDS
minutes=$((duration/60))
seconds=$((duration%60))
printf "\n\nBUILD FINISHED IN $minutes m $seconds s.\n\n"
