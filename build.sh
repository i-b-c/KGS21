SECONDS=0
printf "\nStarting to fetch new data:\n"


printf "\nBuilding...\n"

[ -d "source/_fetchdir" ] && rm -r source/_fetchdir/*
[ ! -d "source/_fetchdir" ] && mkdir -p source/_fetchdir
[ -d "build" ] && rm -r build/*
[ ! -d "build" ] && mkdir -p build
[ ! -d "build/assets" ] && mkdir -p build/assets

echo '==== build ==== Fetch strapiData.yaml from Strapi'
node ./helpers/a_fetch.js

printf '\n\n---------- Creating separate YAML files from strapiData.yaml ----------\n\n'

echo '==== build ==== fetch_articles_from_yaml'
node ./helpers/articles_from_yaml.js

echo '==== build ==== newscast_from_yaml'
node ./helpers/newscast_from_yaml.js

echo '==== build ==== performances_from_yaml'
node ./helpers/performances_from_yaml.js

echo '==== build ==== contact_persons_from_yaml'
node ./helpers/contact_persons_from_yaml.js

echo '==== build ==== categories_from_yaml'
node ./helpers/categories_from_yaml.js

echo '==== build ==== labels_from_yaml'
node ./helpers/labels_from_yaml.js

echo '==== build ==== events_from_yaml'
node ./helpers/events_from_yaml.js

echo '==== build ==== projects_from_yaml'
node ./helpers/projects_from_yaml.js

echo '==== build ==== configuration_from_yaml'
node ./helpers/configuration_from_yaml.js

echo '==== build ==== banners_from_yaml'
node ./helpers/banners_from_yaml.js

echo '==== build ==== locations_from_yaml'
node ./helpers/locations_from_yaml.js

echo '==== build ==== calendar_json.js'
node ./helpers/calendar_json.js

cp -R assets/* build/assets/
node ./node_modules/entu-ssg/src/build.js ./config.yaml full

duration=$SECONDS
minutes=$((duration/60))
seconds=$((duration%60))
printf "\n\nBUILD FINISHED IN $minutes m $seconds s.\n\n"