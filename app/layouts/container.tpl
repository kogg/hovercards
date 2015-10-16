<div class="<% print(_.chain(['container', data.api && ('container--' + data.api), data.type && ('container--' + data.type)]).compact().map(_.prefix).value().join(' ')) %>">
	<div class="<% print(_.chain(['contained', data.api, data.type]).compact().map(_.prefix).value().join(' ')) %>">Test Stuff</div>
</div>
