# This contains all the queries for the analytics page



## Number of events queries

- Number of ``ChannelOpened`` events:

```sql
SELECT Count(*)
FROM "event"
WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474';
```

Node: Number of other events can be obtained BY replacing ``ChannelOpened`` in the querry:

- ``ChannelNewDeposit``
- ``ChannelClosed``
- ``ChannelUnlocked``
- ``NonClosingBalanceProofUpdated``
- ``ChannelSettled``


## AVG number of events per day:

```sql
SELECT number_of_events::decimal / (now()::date - t::date) AS average
FROM (
	SELECT min(timestamp::date) AS t
	FROM "event"
	WHERE address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
) a, 
(
	SELECT count(*) AS number_of_events
	FROM "event"
	WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
) b
```


## Number of active channels in the network

```sql
SELECT opened - closed AS number_of_channels
FROM
(
	SELECT count(*) AS opened 
	FROM "event"
	WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
) a,
(
	SELECT count(*) AS closed
	FROM "event"
	WHERE event = 'ChannelClosed' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
) b
```


## Histogram with number of events per day


```sql
with t AS (
	SELECT generate_series(mitstamp,matstamp,'1 days') AS int
	FROM 
	(
		SELECT min(timestamp) mitstamp, max(timestamp) AS matstamp 
	 	FROM "event" 
		WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
	) a
	order BY int asc
)
SELECT 
	int AS timestampwindowstart,
	count(timestamp) filter (WHERE timestamp >= t.int AND timestamp < (t.int + interval '1 days'))
FROM
	t, (
		SELECT *
		FROM "event"
		WHERE event = 'ChannelOpened' address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
		-- the ChannelOpened can be change for other events in order to obtain the other historgrams
	) a
GROUP BY
  int
order BY
  int
```


## Daily network activity measured BY events in the network

Network activity represents the number of events per day.

```sql
with t AS (
	SELECT generate_series(mitstamp,matstamp,'1 days') AS int
	FROM 
	(
		SELECT min(timestamp) mitstamp, now()::timestamp AS matstamp 
	 	FROM "event" 
		WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
	) a
	order BY int asc
)
SELECT 
	int AS timestampwindowstart,
	count(timestamp) filter (WHERE timestamp >= t.int AND timestamp < (t.int + interval '1 days'))
FROM
	t, (
		SELECT *
		FROM "event"
		WHERE address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
	) a
GROUP BY
  int
order BY
  int
```

## Getting all participants addresses

```sql
with part AS (
	SELECT  args->1#>'{hex}' AS participant1, args->2#>'{hex}' AS participant2
	FROM "event"
	WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
)
SELECT participant1 AS participants
FROM part
union
SELECT participant2 AS participants
FROM part
```


## Counting the number of participants in the network

```sql
with part AS (
	SELECT  args->1#>'{hex}' AS participant1, args->2#>'{hex}' AS participant2
	FROM "event"
	WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
)
SELECT count(participants)
FROM (
	SELECT participant1 AS participants
	FROM part
	union
	SELECT participant2 AS participants
	FROM part
) part
```


## AVG number of tokens used in a deposit

```sql 
Select AVG((args->2#>'{num}')::numeric)
FROM "event"
WHERE event = 'ChannelNewDeposit' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474';
```


## Histogram to show the deposited amount of tokens per day

```sql
with t AS (
    SELECT generate_series(mitstamp,matstamp,'1 days') AS int
    FROM 
    (
        SELECT min(timestamp) mitstamp, now()::timestamp AS matstamp 
        FROM "event" 
        WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
    ) a
    order BY int asc
)
SELECT timestampwindowstart, COALESCE(sum, 0) AS deposited
FROM (
	SELECT 
		int AS timestampwindowstart,
		SUM(deposited) filter (WHERE timestamp >= t.int AND timestamp < (t.int + interval '1 days'))
	FROM
		t, (
			SELECT timestamp, (args->2#>'{num}')::numeric AS deposited 
			FROM "event"
			WHERE event = 'ChannelNewDeposit' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
		) a
	GROUP BY
	  timestampwindowstart
	order BY
	  timestampwindowstart
) res
```


## Max AND Min deposit

```sql
Select max((args->2#>'{num}')::numeric), min((args->2#>'{num}')::numeric)
FROM "event"
WHERE event = 'ChannelNewDeposit' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474';
```


## Max AND Min historgrams

```sql
with t AS (
    SELECT generate_series(mitstamp,matstamp,'1 days') AS int
    FROM 
    (
        SELECT min(timestamp) mitstamp, now()::timestamp AS matstamp 
        FROM "event" 
        WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
    ) a
    order BY int asc
),
deposited_data AS (
	Select timestamp, (args->2#>'{num}')::numeric as deposited_amount
	FROM "event"
	WHERE event = 'ChannelNewDeposit' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
	ORDER BY timestamp
)
SELECT int AS timestampwindowstart, MAX(deposited_amount) -- can be replaced with MIN
FILTER (WHERE timestamp >= t.int AND timestamp < (t.int + interval '1 days'))
FROM t, deposited_data
GROUP BY int
ORDER BY int
```



## All participants that no longer have a channel.

In order to get the number of participants that don't have a channel using the given events.
The following approach was chosen:

`` ALL PARTICIPANTS - PARTICIPANTS WHO STILL HAVE A CHANNEL = *PARTICIPANTS WHO DON'T HAVE A CHANNEL ANYMORE`` 

where ``PARTICIPANTS WHO STILL HAVE A CHANNEL = All participants who are part of the ChannelOpened event and for which the channel was never closed`` 


```sql
with 
separated_participants AS 
(
    SELECT  args->1#>'{hex}' AS participant1, args->2#>'{hex}' AS participant2
	FROM "event"
    WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
), 
all_participants AS (
    SELECT participant1 AS participant
    FROM separated_participants
    union
    SELECT participant2 AS participant
    FROM separated_participants
), 
participants_who_have_a_channel_separated AS 
(
    SELECT channel_args->1#>'{hex}' participant1, channel_args->2#>'{hex}' participant2
    FROM
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id, args AS channel_args
        FROM "event"
        WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
    ) channel_opened_data
    WHERE channel_id NOT IN 
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id
        FROM "event"
        WHERE event = 'ChannelClosed' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
    )
)

SELECT participant
FROM all_participants
WHERE participant NOT IN 
(
    SELECT participant1 AS participant 
    FROM participants_who_have_a_channel_separated 
    union
    SELECT participant2 AS participant 
    FROM participants_who_have_a_channel_separated 
)
```


## AVG number of channels a node opened

```sql
with part AS (
    SELECT  args->1#>'{hex}' AS participant1, args->2#>'{hex}' AS participant2, args->0#>'{num}' AS channel_id
    FROM "event"
    WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
)
SELECT AVG(num_of_channels)
FROM 
(
    SELECT participants, count(channel_id) AS num_of_channels
    FROM 
    (
        SELECT participant1 AS participants, channel_id
        FROM part
        union
        SELECT participant2 AS participants, channel_id
        FROM part
        order BY participants
    ) part_table
    GROUP BY participants
) participants_data
```


## Nodes AND the amount of channels they opened

```sql
with part AS (
    SELECT  args->1#>'{hex}' AS participant1, args->2#>'{hex}' AS participant2,  args->0#>'{num}' AS channel_id
    FROM "event"
    WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
)
SELECT participants, channel_id
    FROM 
    (
        SELECT participant1 AS participants, channel_id
        FROM part
        union
        SELECT participant2 AS participants, channel_id
        FROM part
        order BY participants
    ) part_table
    GROUP BY participants
```


## Participant AND the specific channel he opened

```sql
with part AS (
    SELECT  args->1#>'{hex}' AS participant1, args->2#>'{hex}' AS participant2,  args->0#>'{num}' AS channel_id
    FROM "event"
    WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
)
SELECT participants, channel_id
FROM 
(
	SELECT participant1 AS participants, channel_id
	FROM part
	union
	SELECT participant2 AS participants, channel_id
	FROM part
	order BY participants
) part_table
```

## Network capacity


``Network capacity = sum of all deposited amounts for the channels that are still opened``

```sql 
Select sum(channel_capacity)
FROM 
(
    SELECT (args->0#>'{num}')::numeric AS channel_id, (args->2#>'{num}')::numeric AS channel_capacity
    FROM "event"
    WHERE event = 'ChannelNewDeposit' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
) channels_and_their_deposits
WHERE channel_id NOT IN 
(
    SELECT channel_id 
    FROM
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id 
        FROM "event"
        WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
    ) channel_opened_data
    WHERE channel_id NOT IN 
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id
        FROM "event"
        WHERE event = 'ChannelClosed' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
    )
)
```


## The first three channels with the highest capacity

```sql
Select channel_id, channel_capacity
FROM 
(
    SELECT (args->0#>'{num}')::numeric AS channel_id, (args->2#>'{num}')::numeric AS channel_capacity
    FROM "event"
    WHERE event = 'ChannelNewDeposit' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
) channels_and_their_deposits
WHERE channel_id NOT IN 
(
    SELECT channel_id 
    FROM
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id 
        FROM "event"
        WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
    ) channel_opened_data
    WHERE channel_id NOT IN 
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id
        FROM "event"
        WHERE event = 'ChannelClosed' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
    )
)
order BY channel_capacity DESC
LIMIT 3
```


## The first three channels with the lowest capacity

```sql
Select channel_id, channel_capacity
FROM 
(
    SELECT (args->0#>'{num}')::numeric AS channel_id, (args->2#>'{num}')::numeric AS channel_capacity
    FROM "event"
    WHERE event = 'ChannelNewDeposit' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
) channels_and_their_deposits
WHERE channel_id NOT IN 
(
    SELECT channel_id 
    FROM
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id 
        FROM "event"
        WHERE event = 'ChannelOpened' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474'
    ) channel_opened_data
    WHERE channel_id NOT IN 
    (
        SELECT (args->0#>'{num}')::numeric AS channel_id
        FROM "event"
        WHERE event = 'ChannelClosed' AND address = '0xa5C9ECf54790334B73E5DfA1ff5668eB425dC474' 
    )
)
order BY channel_capacity ASC
LIMIT 3
```