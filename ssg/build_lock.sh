# Sourced by every build script. Builds share source/_fetchdir, build/ and config.yaml
# (targeted path aliases), so two at once corrupt each other. Strapi starts a build on
# every save without waiting, so this lock makes them queue up instead.
# The lock is held on fd 9 until the sourcing script exits. It locks this file itself,
# which always exists and is readable by both root and strapi.
exec 9<"$DIR/build_lock.sh"
echo "Waiting for build lock..."
flock 9
echo "Got build lock."
