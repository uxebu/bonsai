<?php
define('RIAK_URL', 'http://riak.ux:8098');
define('RIAK_BUCKET', 'js-profiles');
define('RIAK_CREATE', RIAK_URL . '/riak/' . RIAK_BUCKET);
define('RIAK_READ', RIAK_URL . '/mapred');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$data = file_get_contents('php://input');
//	if (json_decode($data)) {
		$curl_handle = curl_init(RIAK_CREATE);
		curl_setopt($curl_handle, CURLOPT_POST, true);
		curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl_handle, CURLOPT_POSTFIELDS, $data);
		curl_setopt($curl_handle, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
		curl_exec($curl_handle);
//	}
} else {
	header('Content-Type: application/json; charset=utf-8');
	$query = '{"inputs":"' . RIAK_BUCKET . '","query":[{"map":{"language":"javascript","name":"Riak.mapValuesJson","keep":true}}]}';

	$curl_handle = curl_init(RIAK_READ);
	curl_setopt($curl_handle, CURLOPT_POST, true);
	curl_setopt($curl_handle, CURLOPT_POSTFIELDS, $query);
	curl_setopt($curl_handle, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
	curl_exec($curl_handle);
}
