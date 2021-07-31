const verseClick = (destination, sourceState, targetState, appState) => {
    targetState.setSelectedDocSet(sourceState.selectedDocSet);
    targetState.setSelectedBook(sourceState.selectedBook);
    targetState.setSelectedChapter(sourceState.selectedChapter);
    targetState.setSelectedVerse(destination);
    appState.setUrl('browseVerse');
};

const renderVersesItems = (items, renderChapters, currentVerse, sourceState, targetState, appState) =>
    [...items.entries()]
        .filter(
            (i) =>
                i[1].type !== 'graft' &&
                i[1].subType !== 'end' &&
                (i[1].subType !== 'start' || i[1].payload.startsWith('verses') || i[1].payload.startsWith('chapter'))
        )
        .map((i) =>
            i[1].type === 'scope' ? (
                i[1].payload.startsWith('verses') ?
                    [
                        <b
                            key={i[0]}
                            style={{
                                color: currentVerse && i[1].payload.split('/')[1] === currentVerse.toString() ? '#A00' : '#000',
                                backgroundColor: currentVerse && i[1].payload.split('/')[1] === currentVerse.toString() ? '#FF0' : 'inherit'
                            }}
                            onClick={() =>
                                appState && verseClick(
                                    i[1].payload.split('/')[1],
                                    sourceState,
                                    targetState,
                                    appState,
                                )
                            }
                        >
                            {i[1].payload.split('/')[1]}
                        </b>,
                        ' ',
                    ] :
                    renderChapters ?
                        [
                            <b
                                key={i[0]}
                                style={{backgroundColor: '#DDD', paddingLeft: '0.25em', paddingRight: '0.25em'}}
                            >
                                {i[1].payload.split('/')[1]}
                            </b>,
                            ' ',
                        ] :
                        []
            ) : (
                <span key={i[0]}>{i[1].payload}</span>
            )
        );

export {renderVersesItems};
