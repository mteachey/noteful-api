function makeNotesArray(){
    return[
        {
            id:1,
            date_modified:'2029-01-22T16:28:32.615Z',
            content:'Velit sit et debitis laudantium aut libero. Nisi perferendis alias nihil dolor. Rerum harum voluptatem aliquam nisi illo excepturi aliquam consequatur.\n \rSed in pariatur nisi aut fugiat. Praesentium hic atque consequuntur. Et ratione debitis deserunt. Quibusdam quia sint consectetur minima quas dolorem repudiandae.\n \rEst sapiente hic magnam laborum possimus. Atque adipisci in similique sed nulla necessitatibus aut sed. Laboriosam sunt est numquam omnis eaque.',
            note_name: 'New Note',
            folder_id:1,
        },
        {
            id:2,
            date_modified:'2029-01-22T16:28:32.615Z',
            content:'Velit sit et debitis laudantium aut libero. Nisi perferendis alias nihil dolor. Rerum harum voluptatem aliquam nisi illo excepturi aliquam consequatur.\n \rSed in pariatur nisi aut fugiat. Praesentium hic atque consequuntur. Et ratione debitis deserunt. Quibusdam quia sint consectetur minima quas dolorem repudiandae.\n \rEst sapiente hic magnam laborum possimus. Atque adipisci in similique sed nulla necessitatibus aut sed. Laboriosam sunt est numquam omnis eaque.',
            note_name: 'Test Note',
            folder_id:2,
        },
        {
            id:3,
            date_modified:'2029-01-22T16:28:32.615Z',
            content:'Velit sit et debitis laudantium aut libero. Nisi perferendis alias nihil dolor. Rerum harum voluptatem aliquam nisi illo excepturi aliquam consequatur.\n \rSed in pariatur nisi aut fugiat. Praesentium hic atque consequuntur. Et ratione debitis deserunt. Quibusdam quia sint consectetur minima quas dolorem repudiandae.\n \rEst sapiente hic magnam laborum possimus. Atque adipisci in similique sed nulla necessitatibus aut sed. Laboriosam sunt est numquam omnis eaque.',
            note_name: 'Test Note',
            folder_id:2,
        }
    ]
}

function makeMaliciousNotes(){
    const maliciousNote={
        id:911,
        folder_id:1,
        date_modified:new Date().toISOString(),
        content:`Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        note_name:'Naughty naughty very naughty <script>alert("xss");</script>',
    }
    const expectedNote={
        ...maliciousNote,
        content:`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        note_name:'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {maliciousNote, expectedNote,}
}

module.exports = {
    makeNotesArray,
    makeMaliciousNotes
}