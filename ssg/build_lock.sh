# Sourced by build.sh and by helpers/build_queue.js. Builds share source/_fetchdir, build/
# and config.yaml (targeted path aliases), so two at once corrupt each other: this lock
# makes them run one after another.
# The lock is held on fd 9 until the sourcing process exits. It locks this file itself,
# which always exists and is readable by both root and strapi.
# Re-entrant: a build started while the lock is held (build.sh from the queue's drain)
# sees KGS_BUILD_LOCK_HELD and does not wait for itself.
if [ "$KGS_BUILD_LOCK_HELD" != "1" ]; then
    exec 9<"$DIR/build_lock.sh"
    echo "Waiting for build lock..."
    flock 9
    echo "Got build lock."
    export KGS_BUILD_LOCK_HELD=1
fi
