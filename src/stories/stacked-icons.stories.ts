import { moduleMetadata } from '@storybook/angular';
import { Story, Meta } from '@storybook/angular/types-6-0';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { StackedIconComponent, uswdsAllIcons, allIcons as sdsIcons, IconComponent, StackedIconModule } from 'projects/icons/src/public-api';
import { appendPrefix } from 'src/app/app.module';
import * as _ from 'lodash';

const stackedIconTemplate = require('!!raw-loader!./stacked-icons.html');
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

