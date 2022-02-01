import { moduleMetadata } from '@storybook/angular';
import { Story, Meta } from '@storybook/angular/types-6-0';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { StackedIconComponent, uswdsAllIcons, allIcons as sdsIcons, IconComponent, StackedIconModule } from 'projects/icons/src/public-api';
import { appendPrefix } from 'src/app/app.module';
import * as _ from 'lodash';
import { generateConfig } from 'src/app/shared/sandbox/sandbox-utils';

const stackedIconTemplate = require('!!raw-loader!./stacked-icon-basic/stacked-icon-basic.component.html');
const overviewTemplate = require('!!raw-loader!./stacked-icon-overview/stacked-icon-overview.component.html');

export default {
  title: 'Stacked Icons',
  component: StackedIconComponent,
  subcomponents: {IconComponent},
  decorators: [
    moduleMetadata({
        imports: [
          NgxBootstrapIconsModule.pick(
            Object.assign(
              {},
              _.cloneDeep(allIcons),
              appendPrefix(_.cloneDeep(sdsIcons), 'sds'),
              _.cloneDeep(uswdsAllIcons),
            )
          )
        ],
        declarations: [StackedIconComponent, IconComponent],
    }),
  ],
  argTypes: {
    size: {
      table: {
        disable: true
      }
    },
  }
} as Meta;

export const Overview = () => ({
  template: overviewTemplate.default,
  props: {},
});
Overview.parameters = {options: {showPanel: false}};

const Template: Story = (args) => {
  return {
    props: {
      ...args
    },
    template: stackedIconTemplate.default
  }
};

export const Basic = Template.bind({});
Basic.args = {
};
Basic.parameters = {
  options: {showPanel: true},
  preview: generateConfig('components/stacked-icon/stacked-icon-basic', 'FormlyBasicSearchModule', 'formly-search-basic')
};

