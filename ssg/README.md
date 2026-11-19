# saal.ee static site

Built from Strapi data with entu-ssg, deployed to `/srv/www/saal.ee` on the server.

## How saves reach the site

Every Strapi save (publish, edit, unpublish, delete) enqueues a build request through
`helpers/build_queue.js`. Requests are built one batch at a time under a lock
(`build_lock.sh`): a batch takes everything queued, fetches all data fresh from Strapi,
prepares each saved item's pages, then generates and deploys once. Saves made while a
build runs are merged into the next batch.

A request is only removed from the queue once its build is deployed. Failed requests are
retried with backoff (2, 4, 8, 16 min), then kept in `build_queue/failed/`. A cron job
(`crontab.strapi`) picks up due retries and anything left by a build that died, and runs a
full build nightly.

A save rebuilds that item's own pages (a person save: the contact page). Where an item
also appears on other pages (a person as article author, a category or location name, a
coverage moved to another performance), those pages update with the nightly full build.

## Commands (on the server, as the `strapi` user, in `/srv/ssg`)

    npm run build                                        # full build (queued like any other)
    node helpers/build_queue.js status                   # pending / processing / failed
    node helpers/build_queue.js enqueue performance 2098 null   # rebuild one item
    tail -f logs/build.log                               # build output

`enqueue` and `full` wait for the build to finish; start them with `setsid ... &` to
detach from an ssh session.

## Tests

    npm test
