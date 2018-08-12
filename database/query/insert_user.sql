insert into users 
(email, name, merchant_id, merchant_type, access_token)
values 
('erickhouse01@gmail.com','erick','23432',1,'2343dsf')
on conflict (email) 
do update set name = 'cool'