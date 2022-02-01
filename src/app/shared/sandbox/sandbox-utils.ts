

declare var require;

export function generateConfig(filePath: string, moduleName: string, selector: string) {

  const splitPath = filePath.split('/');
  const fileName = splitPath[splitPath.length - 1];

  const tsFileName = `${fileName}.component.ts`;
  const templateFileName = `${fileName}.component.html`;

  const component = require(`!!raw-loader!../../${filePath}/${tsFileName}`);
  const template = require(`!!raw-loader!../../${filePath}/${templateFileName}`);

  const files = {};
  files[tsFileName] = component.default,
  files[templateFileName] = template.default;

  const sandboxConfig = {
    files,
    moduleName,
    selector
  };

  const preview = [
    {
      tab: tsFileName,
      template: component.default,
      language: "ts",
      copy: true,
    },
    {
      tab: templateFileName,
      template: template.default,
      language: "html",
      copy: true,
    },
  ];

  return preview;
}
