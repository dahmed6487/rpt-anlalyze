The query used to return solutions is :
select distinct s.* from module m ,solutions s  where s.module_id=m.module_id

It is in the csv file and added the guide_url and video_url columns but data is not in there yet, I will fix it later...

the Query called is in the interface DashboardRepository under the package com.mckesson.app.repository.looker;



WHAT I NEED HELP WITH :

javascript side: 

I updated the SolutionsPanel to have the icons linked to open a modal, but its still opening the whole row. I need to remove the achor and have it moved or modified.
need a function to open the guide_url in MODAL from the BWIcon(Line 364)

Need a function to open the video_url in MODAL from the VideoPlayerIcon (Line 393)

IF that takes too much time then best to open the URLS in another page






