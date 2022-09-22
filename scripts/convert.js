const replace = require('replace');
const _ = require('lodash');
const path =  require('path');
const fs =  require('fs');
const { exit } = require('process');
const svgParser = require('svg-parser')

function main(){
  console.log('start convert.js');
  const custom = path.join( __dirname, '..', 'test/svg');
  const desto = path.join( __dirname, '..', 'test/ts');

  fs.readdir(custom, (err, files) => {
    if(err){
      return console.error(err)
    }
    const svgFileExtRegex = /.*\.svg$/
    files.forEach((file, index, array) => {
      const svgMatches = file.match(svgFileExtRegex);
      if(svgMatches && svgMatches.length > 0){
        let fileName = svgMatches[0].split('.svg')[0]

        // Special cases for reserved TS words
        if(fileName === 'delete'){
          fileName = 'deleteIcon';
        }
        if(fileName === 'public'){
          fileName = 'publicIcon';
        }
        // Special cases for reserved TS words

        // Appending USWDS as many icons have names which are idential to SDS icon name. This causes issues with TS
        const prefixedFileName = _.camelCase(`uswds-${fileName}`);
        fs.copyFileSync('./scripts/copy-svg-base-file.ts', path.join(desto,`${prefixedFileName}.ts`));
        replace({
          regex: "ICON_NAME",
          replacement: prefixedFileName,
          paths: [path.join(desto, `${prefixedFileName}.ts`)],
          recursive: false,
          silent: true,
        });

        // Updating all Icons
        replace({
          regex: "ICON_NAME_CAMEL",
          replacement: prefixedFileName,
          paths: [path.join(desto, `allIcons.ts`)],
          recursive: false,
          silent: true,
        });
        replace({
          regex: "SDS_NAME",
          replacement: prefixedFileName,
          paths: [path.join(desto, `allIcons.ts`)],
          recursive: false,
          silent: true,
        });
        replace({
          regex: "ADD_NEW_LINE",
          replacement: "\nimport { ICON_NAME_CAMEL } from './SDS_NAME'ADD_NEW_LINE",
          paths: [path.join(desto, `allIcons.ts`)],
          recursive: false,
          silent: true,
        });
        replace({
          regex: "CAMEL_PLUS_COMMA",
          replacement: `${prefixedFileName},\nCAMEL_PLUS_COMMA`,
          paths: [path.join(desto, `allIcons.ts`)],
          recursive: false,
          silent: true,
        });


        replace({
          regex: "ICON_NAME_CAMEL",
          replacement: prefixedFileName,
          paths: [path.join(desto, `index.ts`)],
          recursive: false,
          silent: true,
        });
        replace({
          regex: "SDS_NAME",
          replacement: prefixedFileName,
          paths: [path.join(desto, `index.ts`)],
          recursive: false,
          silent: true,
        });
        replace({
          regex: "ADD_NEW_LINE",
          replacement: "\nexport { ICON_NAME_CAMEL } from './SDS_NAME'ADD_NEW_LINE",
          paths: [path.join(desto, `index.ts`)],
          recursive: false,
          silent: true,
        });

        fs.readFile(path.join(custom, file), 'utf8',  (err, svgData) => {
          if(err){
            return console.error(err);
          }
          const parsedSVG = svgParser.parse(svgData)
          const viewBox = parsedSVG.children[0].properties.viewBox;
          replace({
            regex: "SVG_ELEMENT",
            replacement: svgData,
            paths: [path.join(desto, `${prefixedFileName}.ts`)],
            recursive: false,
            silent: true,
          });
          let replacementString = 'viewBox'
          if(!parsedSVG.children[0].properties.height){
            const height = viewBox.split(' ')[3];
            replacementString = `height="${height}" ${replacementString}`
          }
          if(!parsedSVG.children[0].properties.width){
            const width = viewBox.split(' ')[2];
            replacementString = `width="${width}" ${replacementString}`
          }
          if(!parsedSVG.children[0].properties.fill){
            replacementString = `fill="currentColor" ${replacementString}`
          }
          replace({
            regex: "viewBox",
            replacement: replacementString,
            paths: [path.join(desto, `${prefixedFileName}.ts`)],
            recursive: false,
            silent: true,
          });

          if(index === array.length - 1){
            replace({
              regex: "import { ICON_NAME_CAMEL } from './SDS_NAME'ADD_NEW_LINE",
              replacement: "",
              paths: [path.join(desto, `allIcons.ts`)],
              recursive: false,
              silent: true,
            });
            replace({
              regex: ",\nCAMEL_PLUS_COMMA",
              replacement: "",
              paths: [path.join(desto, `allIcons.ts`)],
              recursive: false,
              silent: true,
            });
            replace({
              regex: "export { ICON_NAME_CAMEL } from './SDS_NAME'ADD_NEW_LINE",
              replacement: "",
              paths: [path.join(desto, `index.ts`)],
              recursive: false,
              silent: true,
            });
            console.log('finish convert.js')
            exit(0)
          }
        })
      }
    })
  })
}

main();
