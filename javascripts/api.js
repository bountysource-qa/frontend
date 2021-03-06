with (scope('BountySource')) {

  define('api_host', 'https://api.bountysource.com/');
  define('www_host', document.location.href.split('#')[0]);

  // parse arguments: url, [http_method], [params], [callback]
  define('api', function() {
    var args = Array.prototype.slice.call(arguments);

    var options = {
      url:       api_host + args.shift().replace(/^\//,''),
      method:    typeof(args[0]) == 'string' ? args.shift() : 'GET',
      params:    typeof(args[0]) == 'object' ? args.shift() : {},
      callback:  typeof(args[0]) == 'function' ? args.shift() : function(){}
    }
    
    // add in our access token
    options.params.access_token = Storage.get('access_token');
    
    // reload the page if they're not authorized
    var callback = options.callback;
    options.callback = function(response) {
      if (response && response.meta && parseInt(response.meta.status) == 401) {
        Storage.remove('access_token');
        scope.instance.App.unauthorized_callback ? scope.instance.App.unauthorized_callback(options) : set_route('#');
      } else {
        // turn error message into string, or use default
        if (!response.meta.success) {
          if (!response.data.error) {
            response.data.error = "Unexpected error";
          } else if (response.data.error.push) {
            response.data.error = response.data.error.join(', ');
          }
        }

        callback.call(this, response);
      }
    };
    
    JSONP.get(options);
  });

  define('login', function(email, password, callback) {
    api('/user/login', 'POST', { email: email, password: password }, callback);
  });

  define('logout', function() {
    Storage.clear({ except: ['environment'] });
    window.location.reload();
  });

  define('user_info', function(callback) {
    api('/user', callback);
  });
  
  define('get_cached_user_info', function(callback) {
    if (Storage.get('user_info')) {
      callback(JSON.parse(Storage.get('user_info')));
    } else {
      user_info(function(response) {
        if (response.meta.success) {
          set_cached_user_info(response.data);
          callback(response.data);
        }
      });
    }
  });

  define('set_cached_user_info', function(hash) {
    hash ? Storage.set('user_info', JSON.stringify(hash)) : Storage.remove('user_info');
  });

  define('basic_user_info', function(callback) {
    api('/user', 'GET', { basic: true }, callback);
  });

  define('create_account', function(data, callback) {
    api('/user', 'POST', data, callback);
  });

  define('update_account', function(data, callback) {
    api('/user', 'PUT', data, callback);
  });

  define('change_password', function(data, callback) {
    api('/user/change_password', 'POST', data, callback);
  });

  define('reset_password', function(data, callback) {
    api('/user/reset_password', 'POST', data, callback);
  });

  define('request_password_reset', function(data, callback) {
    api('/user/request_password_reset', 'POST', data, callback);
  });

  define('search_users', function(term, callback) {
    api('/github/user/search/' + term, callback);
  });

  define('search_repositories', function(term, callback) {
    api('/github/repos/search', 'GET', { query: term }, callback);
  });

  define('search_issues', function(login, repository, term, callback) {
    api('/github/issues/search/'+login+'/'+repository+'/'+term, callback);
  });

  define('get_repository', function(login, repository, callback) {
    api('/github/repos/'+login+'/'+repository, callback);
  });

  define('get_issues', function(login, repository, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues', callback);
  });

  define('get_issue', function(login, repository, issue_number, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number, callback);
  });

  define('overview', function(callback) {
    api('/overview', callback);
  });

  define('make_payment', function(item, repo_full_name, issue_number, amount, payment_method, redirect_url, callback) {
    var url = '/github/repos/'+repo_full_name + (item == 'Bounty' ? '/issues/'+issue_number+'/bounties' : '/donate');
    api(url, 'POST', { amount: amount, payment_method: payment_method, redirect_url: redirect_url }, callback);
  });

  define('get_user_repositories', function(callback) {
    api('/github/user/repos/', callback);
  });

  define('get_repository_overview', function(login, repository, callback) {
    api('/github/repos/'+login+'/'+repository+'/overview', callback);
  });

  define('create_address', function(data, callback) {
    api('/user/address', 'POST', data, callback);
  });

  define('update_address', function(data, callback) {
    api('/user/address', 'PUT', data, callback);
  });

  define('link_paypal_account', function(data, callback) {
    api('/user/link_paypal', 'POST', data, callback);
  });

  define('get_bounty', function(bounty_id, callback) {
    api('/user/bounties/'+bounty_id, callback);
  });

  define('post_github_comment', function(login, repository, issue_number, form_data, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/comments', 'POST', form_data, callback);
  });

  define('get_fundraisers', function(callback) {
    api('/user/fundraisers', callback);
  });

  define('get_fundraiser', function(id, callback) {
    api('/user/fundraisers/'+id, callback);
  });

  define('create_fundraiser', function(data, callback) {
    api('/user/fundraisers', 'POST', data, callback);
  });

  define('update_fundraiser', function(id, data, callback) {
    api('/user/fundraisers/'+id, 'PUT', data, callback);
  });

  define('publish_fundraiser', function(id, callback) {
    api('/user/fundraisers/'+id+'/publish', 'POST', callback);
  });

  define('destroy_fundraiser', function(id, callback) {
    api('/user/fundraisers/'+id, 'DELETE', callback);
  });

  define('make_pledge', function(fundraiser_id, data, callback) {
    api('/user/fundraisers/'+fundraiser_id+'/pay_in', 'POST', { amount: data.amount, payment_method: data.payment_method, redirect_url: data.redirect_url }, callback);
  });

  define('get_more_cards', function(ignore, callback) {
    api('/cards', 'GET', { ignore: ignore }, callback);
  });

  define('recent_people', function(callback) {
    api('/user/recent', 'GET', callback);
  });

  define('get_pledge', function(pledge_id, callback) {
    api('/user/pledges/'+pledge_id, callback);
  });

  define('redeem_reward', function(pledge_id, reward_id, callback) {
    api('/user/pledges/'+pledge_id+'/redeem_reward', 'POST', { reward_id: reward_id }, callback);
  });

  define('get_user_profile', function(profile_id, callback) {
    api('/users/'+profile_id, callback);
  });

  define('get_pull_requests', function(login, repository, github_user_login, callback) {
    api('/github/repos/'+login+'/'+repository+'/pulls/'+github_user_login, callback);
  });

  define('create_solution', function(login, repository, issue_number, pull_request_number, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/solutions', 'POST', { pull_request_number: pull_request_number }, callback);
  });
}
