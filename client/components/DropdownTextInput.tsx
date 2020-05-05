import React from 'react';
import styled from 'styled-components';
import Dropdown from './Dropdown';

type Props = {
  onInputChange: (value: string) => void;
  onEnterKeyDown?: () => void;
  renderItem: (item: any) => React.ReactNode;
  onSelectItem: (item: any) => void;

  options: Array<any>;
  value: string;
}

const DropdownTextInput = ({
  renderItem,
  onSelectItem,
  onInputChange,
  onEnterKeyDown,
  value,
  options,
}: Props) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  React.useEffect(() => {
    setExpanded(!!options.length);
  }, [options]);

  return (
    <Container>
      <input
        type='text'
        className='input-sm'
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => !expanded && e.key === 'Enter' && onEnterKeyDown && onEnterKeyDown()}
        onFocus={() => {
          options.length && setExpanded(!expanded);
        }}
        value={value}
      />
      <Dropdown
        expanded={expanded}
        options={options}
        renderItem={(item: any) => renderItem(item)}
        onHide={() => setExpanded(false)}
        onSelectItem={(item) => { onSelectItem(item); setExpanded(false); }}
        />
    </Container>
  )
}


const Container = styled.span`
  position: relative;
  display: inline-block;
  white-space: nowrap;
`;

export default DropdownTextInput;
