---


---

<h1 id="using-to-directory-to-authenticate-users">Using TO Directory to Authenticate Users</h1>
<p>This is an in home made example on how to use google authentication and our TO directory in order to authenticate users and manage sessions.<br>
Here at MOS we have a project to manage collaborators information that also hosts the service to authenticate users. It uses Google’s API services since we are also using G Suite to manage domains, emails and other services.<br>
The TO project is hosted <a href="to.lac.mx">here</a>, and it can be found on <a href="https://bitbucket.org/worldwidemos/to/src/master/">this repo</a>.</p>
<h2 id="goal">Goal</h2>
<p>The Goal on using a centralized authentication service is to make it more secure, but most importantly to make it easier to manage users information. This methodology is only concern of MOS employees and other type of users still have to be manage on another service. But MOS administration only has to go to one place in order to make changes to the employee database.<br>
Currently (Nov/18), we only have API functions design for one external project, it being the Vendor Portal. But for future projects, there are some minor changes to be done on the TO project.</p>
<h2 id="requirements">Requirements</h2>
<p>In order to be able to use the authentication and validation functions found in <code>http://to.lac.mx/auth/vendor/google</code>, first we have to meet some requirements:</p>
<ul>
<li>You can use <code>localhost:3003/login</code> as a callback for testing, but for a different url (in production or in another environment) you have to authorize your url in the authorized domains and in the callback list on the google developers console where the project is found (currently on <a href="mailto:norbeto.cerda@lac.mx">norbeto.cerda@lac.mx</a> account).</li>
<li>The callback url is also defined in the TO project as an environment variable (VENDOR_CALLBACK). if it doesn’t exist, the default url is <code>http://localhost:3003/login</code></li>
</ul>
<p>In order to be able to sign in using TO’s API, you also have to meet some basic requirements:</p>
<ul>
<li>You have to have Google Account. This account must be provided by MOS administration. It usually has the <a href="http://worldwidemos.com">worldwidemos.com</a> or <a href="http://lac.mx">lac.mx</a> domain.</li>
<li>You have to be a current user of the TO module. If you aren’t you have to sign in once and you’ll create your account on first sign in.</li>
<li>You have to be a participating collaborator of the portal you want to sign in to. For example, for the Vendor Portal, you, as a user of the TO module, have to have the property <code>isVendorCollaborator === true</code> in order to be able to sign in to the Vendor Portal. This change can only be done by an administrator in the TO module.</li>
</ul>
<h2 id="security-strategy">Security Strategy</h2>
<p>There are only 3 functions to be used in order to set Account Authentication and this security strategy will give you our proposal on how to use it in order to make your platform secure when managing MOS Collaborators.</p>
<p><strong>Getting Google’s url to sign in</strong><br>
This function must be retrieved in the client and it will be the url to redirect the user to send him to google’s sign in form. This function considers TO’s environment variable to get the callback to where to send the user. You should read the requirements to see how to set this callback where google redirects the user after a successful login.<br>
In order to use this function you have to do a get request to <code>http://to.lac.mx/auth/vendor/google</code> and you will receive the url you need in a JSON Object.</p>
<p><strong>Request Example</strong><br>
Using JQuery getJSON method (a shortened ajax get request).</p>
<pre><code>$.getJSON('http://to.lac.mx/auth/vendor/google',function(data){
    //handle data
})
</code></pre>
<p><strong>Response Example</strong></p>
<pre><code>{
	url:"URL_TO_REDIRECT_USER_TO_GOOGLE_SIGN_IN"
}
</code></pre>
<p><strong>Using Google’s code from callback to get tokens and the user’s information</strong><br>
When there is a successful sign in from the url the previous function gave us, google will redirect the user to the callback registered in the configuration and append important information to the query parameters in the callback’s url.<br>
Example:</p>
<pre><code>http://callbackUrl/login?code=GOOGLE_RESULTING_CODE&amp;scope=GOOGLE_SCOPES
</code></pre>
<p>We have to take that code and use another function in order to get the user and a token in order to be able to access other functions in your platform. In order to get the user and token you have to make a http post request to  <code>http://to.lac.mx/auth/vendor/google/getUser</code>. In order to use this function you have to send <code>code</code> in the body of the request.</p>
<p><strong>Request Example</strong><br>
Using JQuery ajax method.</p>
<pre><code>$.ajax({
    type:"POST",
    url:"http://to.lac.mx/auth/vendor/google/getUser,
    data:{
	    code:"GOOGLE_RESULTING_CODE"
	},
	success: successHandler,
	error: errorHandler,
	dataType:"json"
})
</code></pre>
<p><strong>Response Example</strong></p>
<pre><code>{
    "googleInfo":{
	    "access_token":"GOOGLE_ACCESS_TOKEN",
	    "refresh_token":"GOOGLE_REFRESH_TOKEN"
	},
	"user":{
		"username":"USERNAME",
		"email":"EMAIL",
		"name":{
			"first":"FIRST_NAME",
			"last":"LAST_NAME"
		}
	}
}
</code></pre>
<p><strong>Validating an access token and refreshing it</strong><br>
After you got your first access_token, you can use it to authorize the user on certain actions on your platform. The access token has an expiration of 3600 seconds and the refresh token doesn’t expire, but it is only valid as long as the access token does not fully expire when you use the refresh token to get a new access token. The proposed methodology includes the use of a verification function every single time the user refreshes or navigates the your platform as long as he doesn’t stay inactive for the expiration time. When the user looses the access token validity he has to sign in again to get a new access token and refresh token. A refreshed access token is different than the previous one. But the refresh token doesn’t change as long as the access token expiration timer doesn’t reach 0.<br>
In order to verify the access token you have to make a http post request to <code>http://to.lac.mx/auth/vendor/google/verifyToken</code> and you have to send the access token as well as the refresh token in the body of the request.</p>
<p><strong>Request Example</strong><br>
Using JQuery ajax method.</p>
<pre><code>$.ajax({
    type:"POST",
    url:"http://to.lac.mx/auth/vendor/google/verifyToken",
	data:{
		access_token:"CURRENT_ACCESS_TOKEN",
		refresh_token:"REFRESH_TOKEN"
	},
	success: successHandler,
	error: errorHandler,
	dataType:"json"
}
</code></pre>
<p><strong>Response Example</strong></p>
<pre><code>{
    "googleInfo":{
	    "access_token":"NEW_ACCESS_TOKEN"
	},
	"user":{
		"username":"USERNAME",
		"email":"EMAIL",
		"name":{
			"first":"FIRST_NAME",
			"last":"LAST_NAME"
		},
		"role":"ROLE"
	}
}
</code></pre>
<h2 id="authentication-flow">Authentication Flow</h2>
<p><img src="https://doc-10-a0-docs.googleusercontent.com/docs/securesc/s4bvkubcprqvqe65j8tglqe8r7ulhu3n/4kjnpa77ng017aasgqgbjbdu9d4o9832/1542139200000/15817277268922216748/15817277268922216748/17HeUEVR4yvvm5zcAsYjAPdE3Skzoe7Yr" alt="Flow Diagram for Authentication"></p>
<blockquote>
<p>Written with <a href="https://stackedit.io/">StackEdit</a>.</p>
</blockquote>

