// Your Assignment2 JavaScript code goes here

const url = 'http://ec2-54-172-96-100.compute-1.amazonaws.com/feed/random?q=noodle';

function constructBlock(tweet) {
    let template = '<div id="{{tweet_id}}">\n' +
        '    <div class="tweet" tabindex="0">\n' +
        '    <img src="{{profile_url}}" onerror="fixError(this)" alt="profile">\n' +
        '    <div class="tweetRight">\n' +
        '        <div class="accountDescription">\n' +
        '        <div class="texts">\n' +
        '            <div class="line1"><div>{{display_name}}</div></div>\n' +
        '            <div class="line2"><div>{{username}}</div></div>\n' +
        '            <div class="line2"><div>{{date}}</div></div>\n' +
        '        </div>\n' +
        '        </div>\n' +
        '        <div class="tweetContent" aria-label="tweet content">\n' +
        '        {{content}}\n' +
        '        </div>\n' +
        '    </div>\n' +
        '    </div>\n' +
        '<hr />\n' +
        '</div>\n';

    let options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric'};
    let date = new Date(tweet.created_at).toLocaleDateString('en-US', options);

    return template.replace('{{tweet_id}}', tweet.id)
        .replace('{{profile_url}}', tweet.user.profile_image_url)
        .replace('{{display_name}}', tweet.user.name)
        .replace('{{username}}', '@' + tweet.user.screen_name)
        .replace('{{date}}', date)
        .replace('{{content}}', tweet.text);
}

/*eslint-disable no-unused-vars*/
function fixError(image) {  // fix image loading error
    /*eslint-enable no-unused-vars*/
    image.onerror= '';
    if (image.src !== 'images/penguin.png') {
        image.src = 'images/penguin.png';
    }
}

let content = {};     // id -> tweet text
let contentDOM = {};  // id -> DOM objects
let contentFilter = new Set();  // id: search result; if empty then all ids
let searchString = ''; // here we use a global variable
let contentElement = $('#tweets');
let stateElement = $('#state');
let refresh = true;

function updateContent(statuses) {
    statuses.forEach(status => {
        if (status.id in content) {
            return;
        }
        content[status.id] = status.text.toLowerCase();
        contentDOM[status.id] = constructBlock(status);
    });
}

function updateFilter() {
    // update filter
    if (searchString !== '') {
        contentFilter = new Set();
        Object.keys(content).forEach(k => {
            if (content[k].includes(searchString)) {
                contentFilter.add(k);
            }
        });
    }
    else {
        contentFilter = new Set(Object.keys(content));
    }
}

function updateWebpagePartial() {
    updateFilter();
    let contentList = Object.keys(content).sort((a, b) => {return b-a;});
    contentList.forEach(k => {
        if (contentFilter.has(k)) {
            $('#' + k).show();
        }
        else {
            $('#' + k).hide();
        }
    });
}

function updateWebpageFull() {
    updateFilter();
    let result = '';
    let contentList = Object.keys(content).sort((a, b) => {return b-a;});
    contentList.forEach(k => {
        result += contentDOM[k];
    });
    contentElement.html(result);
    contentList.forEach(k => {
        if (contentFilter.has(k)) {
            $('#' + k).show();
        }
        else {
            $('#' + k).hide();
        }
    });
}

function myFetch() {
    stateElement.html('Refreshing...');
    let result = fetch(url)
        .then(res => res.json())
        .then(data => {
            let count = data.search_metadata.count;
            console.log(count);
            updateContent(data.statuses);
            updateWebpageFull();
            // do something with data
        })
        .catch(err => {
            // error catching
            console.log(err);
        });
    result.then(() => {
        if (refresh) {
            stateElement.html('Pause');
        }
        else {
            stateElement.html('Start');
        }
    });
}

let handle = setInterval(myFetch, 20000);
myFetch();

$('#search').on('input', (event) => {
    searchString = event.target.value.trim().toLowerCase();
    updateWebpagePartial();
});

/*eslint-disable no-unused-vars*/
stateElement.on('click', (event) => {
    /*eslint-enable no-unused-vars*/
    if (refresh) {
        clearInterval(handle);
        stateElement.html('Start');
    }
    else {
        handle = setInterval(myFetch, 20000);
        stateElement.html('Pause');
    }
    refresh = !refresh;
});

/*eslint-disable no-unused-vars*/
$('#state').on('mouseover', (event) => {
    /*eslint-enable no-unused-vars*/
    if (refresh) {
        stateElement.html('Pause');
    }
    else {
        stateElement.html('Start');
    }
});