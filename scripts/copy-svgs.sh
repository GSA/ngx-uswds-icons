#!/usr/bin/env bash

ICON_ROOT_DIR=$(pwd)
SCRIPTS_DIR="${ICON_ROOT_DIR}/scripts"
BASE_USWDS_DIR="${ICON_ROOT_DIR}/test"
SVG_DIR="$BASE_USWDS_DIR/svg"
# Copying usa-icons rather than img to avoid duplicates in iconNames when converting. usa-icons includes all icons shown on demo page
USWDS_NODE_DIR="${ICON_ROOT_DIR}"/node_modules/uswds/src/img/usa-icons
TS_DIR="$BASE_USWDS_DIR/ts"
BASE_TS_FILE="$SCRIPTS_DIR/copy-svg-base-file.ts"
USWDS_ICONS_DIR="${ICON_ROOT_DIR}/projects/icons/src/lib/uswds-icons"

#Recursively finds all files, removing them if they are not an svg format. The remaining files are then moved to root/test
function filterAndMoveIcons(){
  # If passed in path is a directory
  if [[ -d $1 ]]; then
    # Iterate through paths in that directory
    for i in "$1"/*; do
      filterAndMoveIcons $i
    done
  else
    if removeNonSvg $1; then
      mv $1 $SVG_DIR
    fi
  fi
}

# Removes non-svg files. Returns true if file was not removed so it can be moved to root
function removeNonSvg(){
  endsWithSvgPattern="svg$"
  if [[ $1 =~ $endsWithSvgPattern ]]; then # If there is a regex match between path passed in and $endsWithSvgPattern
    return 0
  else
    rm -f $1
    return 1
  fi
}



#If working dir exists, delete and recreate
if ! [[ -d $BASE_USWDS_DIR ]]; then
  mkdir $BASE_USWDS_DIR
else
  rm -rf $BASE_USWDS_DIR
  mkdir $BASE_USWDS_DIR
fi

#create seperate folder for svgs in working dir
if ! [[ -d $SVG_DIR ]]; then
  mkdir $SVG_DIR
else
  rm -rf $SVG_DIR
  mkdir $SVG_DIR
fi

#create seperate folder for generated TS files in working dir
if [[ -d $TS_DIR ]]; then
  rm -rf $TS_DIR
  mkdir $TS_DIR
else
  mkdir $TS_DIR
fi

#If icons dir that will be packaged exists, delete and recreate
if ! [[ -d $USWDS_ICONS_DIR ]]; then
  mkdir $USWDS_ICONS_DIR
else
  rm -rf $USWDS_ICONS_DIR
  mkdir $USWDS_ICONS_DIR
fi

cp -r $USWDS_NODE_DIR $SVG_DIR

filterAndMoveIcons $SVG_DIR

#cleanup empty dirs
rm -rf "$SVG_DIR/img"

#copy base files into TS working dir
cp "$SCRIPTS_DIR/allIcons.ts" $TS_DIR
cp "$SCRIPTS_DIR/index.ts" $TS_DIR

#Run JS script to do conversion of SVG to TS files
node scripts/convert.js

mv $TS_DIR/* $USWDS_ICONS_DIR

rm -rf $BASE_USWDS_DIR

echo "done"
