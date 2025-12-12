import type { Meta, StoryObj } from '@storybook/react';

import { Table, TBody, TD, TH, THead, TR } from './table';

const meta: Meta = {
  title: 'UI/Table',
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <div className="overflow-x-auto rounded border border-slate-200">
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH className="text-right">Value</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>Foo</TD>
            <TD className="text-right">1</TD>
          </TR>
          <TR>
            <TD>Bar</TD>
            <TD className="text-right">2</TD>
          </TR>
        </TBody>
      </Table>
    </div>
  ),
};
