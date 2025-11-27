const ws = new WebSocket(`ws://localhost:9000/lobby/${lobbyId}/ws?user=${encodeURIComponent(username)}`);

const messagesDiv = document.getElementById('messagesDiv');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
player = ""

ws.onopen = () => {
    const p = document.createElement("p");
    p.innerText = "Connected to lobby!";
    messagesDiv.appendChild(p);
};

ws.onmessage = (msg) => {
    console.log(msg);
    let data;
    try {
    data = JSON.parse(msg.data);
    } catch (e) {
    data = { message: msg.data };
    }

    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    const type = data["type"]
    data = data["data"]

    if (type == "GameUpdate") {
        const token = document.querySelector('meta[name="csrf-token"]').content;
        fetch("/board/render", {
            method: "POST",
            headers: { 
            "Content-Type": "application/json",
            "Csrf-Token": token
            },
            body: JSON.stringify(data.game)
        })
        .then(res => res.text())
        .then(html => {
            $('#board-area').html(html);
        });

        if (data.dice && Array.isArray(data.dice)) {
            var $panel = $('.dice-panel');
            if (data.currentPlayer == player) {
                $panel.addClass('player-turn-shadow');
            } else {
                $panel.removeClass('player-turn-shadow');
            }

            var $ul = $('.dice-panel ul');
            if ($ul.length) {
                $ul.empty();
                data.dice.forEach(function (d) {
                var src = '/assets/images/dice-' + d + '.png';
                var $li = $("<li class='list-inline-item' aria-label='Würfel'></li>");
                $li.append(
                    "<img src='" +
                    src +
                    "' alt='Würfel mit Zahl " +
                    d +
                    "' class='dice-img'>"
                );
                $ul.append($li);
                });
            }
        }
    }

    if (type === "PlayerAssigned") {
    player = data.color
    const badge = document.getElementById("playerBadge");
    badge.classList.remove("d-none");
    badge.className = "badge";
    if (data.color === "White") {
        badge.classList.add("bg-light", "text-dark");
        badge.innerText = "You are WHITE";
    } else if (data.color === "Black") {
        badge.classList.add("bg-dark", "text-light"); 
        badge.innerText = "You are BLACK";
    }

    return; 
    }

    if (type == "ChatBroadcast") {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    const timeSpan = document.createElement('div');
    timeSpan.classList.add('timestamp');
    timeSpan.innerText = timestamp;
    messageDiv.appendChild(timeSpan);

    if (data.user) {
        const userSpan = document.createElement('span');
        userSpan.classList.add('user');
        userSpan.style.fontWeight = "bold";
        userSpan.innerText = data.user + ": ";

        const textSpan = document.createElement('span');
        textSpan.innerText = data.text;

        messageDiv.appendChild(userSpan);
        messageDiv.appendChild(textSpan);
    } else {
        messageDiv.innerText = data.text;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
};

ws.onclose = () => {
    const p = document.createElement("p");
    p.innerText = "WebSocket closed.";
    messagesDiv.appendChild(p);
};

document.getElementById("sendBtn").addEventListener("click", () => {
    const input = document.getElementById("chatInput");
    ws.send(JSON.stringify({ type: "ChatMessage", user: "@username", text: input.value }));
    input.value = "";
});

document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') sendBtn.click();
});