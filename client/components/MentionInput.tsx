import React from 'react';
import styled from 'styled-components';
import Dropdown from './Dropdown';

const GetCoords = (textArea: any, index: number) => {
  let replica = document.createElement('div');
  document.body.appendChild(replica);
  const copyStyle = getComputedStyle(textArea as Element);
  for (const prop of copyStyle) {
    replica.style[(prop as any)] = copyStyle[(prop as any)];
  }
  replica.style.whiteSpace = 'break-spaces';
  replica.style.position = 'absolute';
  replica.style.visibility = 'hidden';

  replica.textContent = '\n' + textArea.value.substring(0, index);
  const span = document.createElement('span');
  replica.appendChild(span);
  
  const coordinates = {
    y: span.offsetTop + parseInt(copyStyle['borderTopWidth']),
    x: span.offsetLeft + parseInt(copyStyle['borderLeftWidth'])
  };
  document.body.removeChild(replica);

  return coordinates;
};

interface Mention {
  symbol: string;
  options: Array<any>;
  field: string;
  secondaryField?: string;
}

interface Props {
  mentionList: Array<Mention>;
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
  const [list, updateMentionList] = React.useState<Array<any>>(mentionList[0].options);
  const [mentionIndex, setMentionIndex] = React.useState<number>(0);
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
    let _mentionIndex = mentionIndex;
    const arrLastIndex = mentionList.map(x => prevValue.lastIndexOf(x.symbol));
    let startPos = Math.max(...arrLastIndex);
    if (startPos > -1 && 
        (prevValue[startPos - 1] === '' ||
         prevValue[startPos - 1] === '\n' ||
         prevValue[startPos - 1] === '\r' ||
         prevValue[startPos - 1] === ' ' ||
         prevValue[startPos - 1] === undefined)) {
            _mentionIndex = arrLastIndex.findIndex(x => x === startPos);
            setMentionIndex(_mentionIndex);
            startPos += 1;
         } 
    
    
    if (character === '\n' || character === '\r' || value.trim() === '') {
      setExpanded(false);
      return;
    }
    if (startPos < 0) setExpanded(false);

    if (startPos > -1 && startPos != startAt) {
      setExpanded(true);
      const coord = GetCoords(ParentRef.current, startPos);
      setPosition(coord);
      setStartAt(startPos);
    }


    if (startPos > -1) {
      setMentionSize(start - startPos);
      const mention = value.substring(startPos, start).toLowerCase();
      const updatedList = mentionList[_mentionIndex].options.filter( x => x[mentionList[_mentionIndex].field].toString().substring(0, start - startPos).toLowerCase() === mention );
      updateMentionList(updatedList);

      setExpanded(!!updatedList.length);
    }
  }

  const handleMentionInsert = (value: string) => {
    const _mentionItem = mentionList[mentionIndex];
    const textArea = ParentRef.current!;
    const startPos = textArea.value.substring(0, textArea.selectionStart).lastIndexOf(_mentionItem.symbol) + _mentionItem.symbol.length;
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
              <span>{item[mentionList[mentionIndex].field].toString()}</span>
              {mentionList[mentionIndex].secondaryField && item[mentionList[mentionIndex].secondaryField!] ? <small>{item[mentionList[mentionIndex].secondaryField!].toString()}</small> : null}
            </React.Fragment>
          )
        }}
        onHide={() => setExpanded(false)}
        onSelectItem={(item) => handleMentionInsert(item[mentionList[mentionIndex].field].toString())}
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
