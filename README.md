# JIRA -> Trello Migration

This is a really simple utility to help port JIRA issues into Trello. This does not perform a very faithful migration. It primarily just makes sure all the issues make it to Trello.

## Downloading from JIRA

While this is called jira-trello-migration it is more accurately a json issue uploader. You must use [jira-sync](https://github.com/programmiersportgruppe/jira-sync) to download your issues from JIRA. The files that are downloaded from there can then be used here to upload to Trello. If you want to migrate your issue attachments too, [this pull request](https://github.com/programmiersportgruppe/jira-sync/pull/3) must be merged or you can use [my fork and branch](https://github.com/jonathonwalz/jira-sync).

To download without attachments:

    jira-sync --baseurl https://*.atlassian.net --user username --project PROJECT --target issues/PROJECT/json fetch

To download with attachments:

    jira-sync --baseurl https://*.atlassian.net --user username --project PROJECT --target issues/PROJECT/json --attachments issues/PROJECT/attachments fetch

## Getting ready in Trello

You need to setup access in Trello to use the command:

1. [Generate an API key](https://trello.com/1/appKey/generate) and make a note of the public key.
2. Get a token for your user. Use the following URL making sure to replace the <PUBLIC_KEY> placeholder with your public key from step 1: `https://trello.com/1/connect?key=<PUBLIC_KEY>&name=JIRAMigrate&response_type=token&scope=read,write`
3. Create a board (or use and existing one). Make a note of the board id, this can be  found in the URL `https://trello.com/b/<BOARD ID>/`

## Upload to Trello

There are 2 variants of the command. One to upload with attachments one without. The placeholders correspond to the strings you got is steps 1 (<PUBLIC_KEY>), 2 (<TOKEN>), and 3 (<BOARD_ID>)

To upload to without attachments:

    ./jira-trello-migrate.js -k <PUBLIC_KEY> -t <TOKEN> -b <BOARD_ID> -p issues/PROJECT/json 

To upload to with attachments:

    ./jira-trello-migrate.js -k <PUBLIC_KEY> -t <TOKEN> -b <BOARD_ID> -p issues/PROJECT/json -a issues/PROJECT/attachments