<div class="<% print(_.prefix('container')) %>">
	<div class="<% print(_.chain(['box', data.api && ('box--' + data.api), data.type && ('box--' + data.type)]).compact().map(_.prefix).value().join(' ')) %>">Test Stuff</div>
</div>
