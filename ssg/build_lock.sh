# Sourced by build.sh and helpers/build_queue.js. Builds share source/_fetchdir, build/
# and config.yaml (targeted path aliases), so two at once corrupt each other: this lock
# makes them run one after another.
# The lock is held on fd 9 until the sourcing process exits. It locks this file itself,
# which always exists and is readable by both root and strapi.
# Re-entrant: a build started while the lock is held (build.sh from the queue's drain)
# sees KGS_BUILD_LOCK_HELD and does not wait for itself.
# With KGS_BUILD_LOCK_NONBLOCK=1 the sourcing shell exits quietly if a build is running.
if [ "$KGS_BUILD_LOCK_HELD" != "1" ]; then
    exec 9<"$DIR/build_lock.sh"
    if [ "$KGS_BUILD_LOCK_NONBLOCK" = "1" ]; then
        flock -n 9 || exit 0
    else
        echo "Waiting for build lock..."
        flock 9
        echo "Got build lock."
    fi
    export KGS_BUILD_LOCK_HELD=1
fi
