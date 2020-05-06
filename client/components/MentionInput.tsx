import React from 'react';
import styled from 'styled-components';
import Dropdown from './Dropdown';

const GetCoords = (textArea: any, index: number, symbol: any) => {
  let replica = document.createElement('div');
  const copyStyle = getComputedStyle(textArea as Element);
  for (const prop of copyStyle) {
    replica.style[(prop as any)] = copyStyle[(prop as any)];
  }
  replica.style.height = 'auto';
  replica.style.width = 'auto';
  let span = document.createElement('span');
  replica.appendChild(span);

  let content = textArea.value.substr(0, index) + symbol;
  let contentLines = content.split(/[\n\r]/g);
  let currentline = content.substr(0, content.selectionStart).split(/[\n\r]/g).length;
  let replicaContent = '';

  contentLines.map((l: any, i: any) => {
    if (i === currentline - 1 && i < contentLines.length) {
      replicaContent += contentLines[i];
      return l;
    }
    replicaContent += '\n';
  });
  span.innerHTML = replicaContent.replace(/\n$/, '\n^A');
  document.body.appendChild(replica);
  const { offsetWidth: spanWidth, offsetHeight: spanHeight } = span;
  document.body.removeChild(replica);

  return {
    x: (spanWidth > textArea.offsetWidth ? textArea.offsetWidth : spanWidth) + textArea.offsetLeft,
    y: (spanHeight > textArea.offsetHeight ? textArea.offsetHeight: spanHeight) + textArea.offsetTop
  };
};

interface Props {
  symbol?: string;
  field?: string;
  secondaryField?: string;
  mentionList: Array<any>;
  fieldId: string;
  fieldStyle?: string;
  fieldRows?: number;
  fieldCols?: number;
  fieldName?: string;
  value: string;
  onChange?: (value: string) => void;
  renderMentionItem?: (item: any) => React.ReactNode;
}

const MentionInput: React.FC<Props> = ({
  symbol = '@',
  field = 'name',
  secondaryField,
  mentionList,
  onChange,
  renderMentionItem,
  fieldStyle = 'form-control',
  fieldId,
  fieldRows = 7,
  fieldCols = 80,
  fieldName = '',
  value,
}: Props) => {
  const ParentRef = React.useRef<HTMLTextAreaElement>(null);
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: -1, y: -1 });
  const [list, updateMentionList] = React.useState<Array<any>>(mentionList);
  const [mentionSize, setMentionSize] = React.useState<number>(0);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [startAt, setStartAt] = React.useState<number>(-1);

  React.useEffect(() => {
    if (ParentRef) {
      ParentRef.current!.value = value;
    }
  }, [ value, ParentRef ]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const start = e.target.selectionStart;
    const character = value.substring(start - 1, start);

    onChange && onChange(value);

    const prevValue = value.substring(0, start);
    let startPos = prevValue.lastIndexOf(`${symbol}`);
    if (startPos > -1 && 
        (prevValue[startPos - 1] === '' ||
         prevValue[startPos - 1] === '\n' ||
         prevValue[startPos - 1] === '\r' ||
         prevValue[startPos - 1] === ' ' ||
         prevValue[startPos - 1] === undefined)) startPos += symbol.length;
    
    
    if (character === '\n' || character === '\r' || value.trim() === '') {
      setExpanded(false);
      return;
    }
    if (startPos < 0) setExpanded(false);

    if (startPos > -1 && startPos != startAt) {
      setExpanded(true);
      const coord = GetCoords(ParentRef.current, startPos, symbol);
      setPosition(coord);
      setStartAt(startPos);
    }


    if (startPos > -1) {
      setMentionSize(start - startPos);
      const mention = value.substring(startPos, start).toLowerCase();
      const updatedList = mentionList.filter( x => (x[field] as string).substring(0, start - startPos).toLowerCase() === mention );
      updateMentionList(updatedList);

      setExpanded(!!updatedList.length);
    }
  }

  const handleMentionInsert = (value: string) => {
    const textArea = ParentRef.current!;
    const startPos = textArea.value.substring(0, textArea.selectionStart).lastIndexOf(`${symbol}`) + symbol.length;
    const first = textArea.value.substr(0, startPos);
    const last = textArea.value.substr(
      startPos + mentionSize,
      textArea.value.length
    );
    const content = `${first}${value} ${last}`;
    textArea.value = content;
    setMentionSize(value.length);
    textArea.focus();
    if (onChange) onChange(textArea.value);
    updateMentionList([]);
    setMentionSize(0);
    setExpanded(false);
  }

  return (
    <Container>
      <Dropdown
        expanded={expanded && list.length > 0}
        position={position}
        options={list}
        ParentRef={ParentRef}
        renderItem={(item) => {
          return renderMentionItem ? (
            renderMentionItem(item)
          ) : (
            <React.Fragment>
              <span>{item[field]}</span>
              {secondaryField ? <small>{item[secondaryField]}</small> : null}
            </React.Fragment>
          )
        }}
        onHide={() => setExpanded(false)}
        onSelectItem={(item) => handleMentionInsert(item[field])}
        />
      <textarea
        id={fieldId}
        name={fieldName}
        className={fieldStyle}
        rows={fieldRows}
        cols={fieldCols}
        ref={ParentRef}
        onChange={handleTextChange}
        />
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`

export default MentionInput;
