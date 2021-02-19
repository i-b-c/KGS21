#!/bin/bash
PREVBACKUPDIR="backup/""$(cd /srv/backup && ls -1t | grep "^b.*[0-9]$" | head -1)"
echo "$PREVBACKUPDIR"
TIMESTAMP=`date +%Y-%m-%d_%H-%M-%S`
exec &> /srv/backup/backup_"$TIMESTAMP".log
NEWBACKUPDIR="backup/backup_""$TIMESTAMP"
mkdir /srv/"$NEWBACKUPDIR"
STARTDIR=/srv/backup/temp

COPIEDSYMLINKS=0
CREATEDSYMLINKS=0
COPIEDFILES=0
NEWCOPIEDFILES=0


cd "$STARTDIR"

contentreader()
{
    if [ "$SUPERDIR" != "$STARTDIR" ]
    then
        cd "$SUPERDIR"
    fi

    for THING in "$SUPERDIR"/*; do
        if [ -d "$THING" ] 
        then
            # echo ""
            # echo "FOLDER $THING contains:"
            SUPERDIR=$THING
            newdir=${SUPERDIR/"www/saal.ee"/"$NEWBACKUPDIR"}
            mkdir "$newdir"
            contentreader "$SUPERDIR"
        else
            stringtoarray=(${THING##/*/})
            if [ "${stringtoarray[-1]}" != "*" ] 
            then
                # echo "- File: $THING"
                prebackupLoc=${THING/"www/saal.ee"/"$PREVBACKUPDIR"}
                newbackupLoc=${prebackupLoc/"$PREVBACKUPDIR"/"$NEWBACKUPDIR"}
                originstat=$(sha256sum "$THING" | cut -d " " -f 1 )

                if [ -L "$prebackupLoc" ]
                then
                    symlinktarget="$(readlink -f "$prebackupLoc")"
                    symlinktargetstat=$(sha256sum "$symlinktarget" | cut -d " " -f 1 )
                    if [ "$originstat" = "$symlinktargetstat" ]
                    then
                        cp -P "$prebackupLoc" "$newbackupLoc"
                        echo copied symlink from $prebackupLoc to $newbackupLoc  
                        ((COPIEDSYMLINKS++))
                    else
                        # File has changed in origin, cp file from origin to new backup
                        cp "$THING" "$newbackupLoc"  
                        echo copied changed file from $THING to $newbackupLoc  
                        ((COPIEDFILES++))
 
                    fi   
                else
                    prevbackupstat=$(sha256sum "$prebackupLoc" | cut -d " " -f 1 )
                    if [ "$originstat" = "$prevbackupstat" ]
                    then
                        # File hasn't changed in origin, create symlink from file in previous backup to new backup
                        cp -s "$prebackupLoc" "$newbackupLoc"
                        echo created symlink from file $prebackupLoc to $newbackupLoc  
                        ((CREATEDSYMLINKS++))
                    elif [ -f "$prebackupLoc" ]
                    then
                        # File has changed in origin, cp file from origin to new backup
                        cp "$THING" "$newbackupLoc"  
                        echo copied changed file, which had no symlink $THING to $newbackupLoc  
                        ((COPIEDFILES++))
                    else 
                        # New file in origin, cp file from origin to new backup
                        cp "$THING" "$newbackupLoc"  
                        echo copied new file $THING to $newbackupLoc  
                        ((NEWCOPIEDFILES++))
                    fi
                fi
            else
                echo "- [No files or folders]"
            fi
        fi
    done
}
SUPERDIR=$STARTDIR
contentreader $SUPERDIR

echo
echo
echo backup $TIMESTAMP finished `date +%Y-%m-%d_%H-%M-%S`
echo "$COPIEDSYMLINKS" - symlinks copied
echo $CREATEDSYMLINKS - symlinks created
echo $COPIEDFILES - existing, changed files copied
echo $NEWCOPIEDFILES - new files copied
echo
echo $(find $STARTDIR -type f | wc -l) - total files in $STARTDIR
echo $(($COPIEDSYMLINKS+$CREATEDSYMLINKS+$COPIEDFILES+$NEWCOPIEDFILES)) - total backup entries created

rm -r /srv/backup/temp

exit
