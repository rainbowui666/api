create database jyhs;
use jyhs;
create table user(
    id int not null auto_increment,
    name varchar(20) not null,
    password varchar(200) not null,
    city varchar(50) not null,
    phone varchar(20) not null,
    type varchar(20) not null default 'consumer',
    status int not null default 0,
    primary key(id)
);
alter table user add column point int not null default 0;
alter table user add column address varchar(200);
alter table user add column description varchar(2000);
alter table user add column province varchar(20);
alter table user add column pay_type varchar(20);
alter table user add column contacts varchar(20);
alter table user add column code varchar(20);
alter table user add column nickname varchar(100);
alter table user add column sex int;
alter table user add column province_name varchar(100);
alter table user add column city_name varchar(100);
alter table user add column country varchar(100);
alter table user add column headimgurl varchar(2000);
alter table user add column privilege varchar(2000);
alter table user add column openid varchar(1000);
alter table user add column insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
alter table user modify column city varchar(50) null;
alter table user modify column type varchar(20) DEFAULT 'yy';


create table material(
    id int not null auto_increment,
    category varchar(20) not null,
    name varchar(20) not null,
    type varchar(20) not null,
    ename varchar(50),
    sname varchar(50),
    tag varchar(100),
    code varchar(50) not null,
    level varchar(50) not null,
    price int not null,
    description varchar(4000),
    compatibility  varchar(20) not null,
    img_number int,
    primary key(id)
);
alter table material change `name` `name` varchar(100) character set utf8 not null ;
alter table material change `tag` `tag` varchar(100) character set utf8 not null ;
alter table material character set utf8;

create table bill_detail(
    id int not null auto_increment,
    bill_id int not null,
    name varchar(200) not null,
    size varchar(20),
    price int not null,
    point int,
    material_id int,
    primary key(id)
);
alter table bill_detail change `name` `name` varchar(200) character set utf8 not null ;
alter table bill_detail change `size` `size` varchar(20) character set utf8 not null ;
alter table bill_detail add column numbers int;
alter table bill_detail add column limits int;
alter table bill_detail add column recommend varchar(20);


alter table bill_detail character set utf8;

create table bill(
    id int not null auto_increment,
    name varchar(100) not null,
    contacts varchar(20) not null,
    phone varchar(20) not null,
    description varchar(4000),
    upload_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    primary key(id)
);
alter table bill change `name` `name` varchar(100) character set utf8 not null ;
alter table bill change `contacts` `contacts` varchar(20) character set utf8 not null ;
alter table bill change `description` `description` varchar(4000) character set utf8 not null ;
alter table bill add column effort_date TIMESTAMP;
alter table bill add column supplier_id int not null;
alter table bill add column is_one_step int  default 0;



create table group_bill(
    id int not null auto_increment,
    name varchar(100) not null,
    contacts varchar(100) not null,
    phone varchar(20) not null,
    end_date  TIMESTAMP  not null,
    pickup_address varchar(200) not null,
    pay_type varchar(10) not null,
    pay_count varchar(50) not null,
    pay_name varchar(50) not null,
    freight double(3,2) not null,
    pay_description varchar(500),
    description varchar(4000) not null,
    isflash  int,
    flash_desc varchar(500),
    bill_id int not null,
    user_id int not null,
    primary key(id)
);
alter table group_bill add column pickup_date timestamp default now();
alter table group_bill add column status int not null DEFAULT 1;
alter table group_bill add column city varchar(10);
alter table group_bill add column province varchar(20);
alter table group_bill add column current_step int not null DEFAULT 0;
alter table group_bill add column top_freight int  DEFAULT 0;


alter table group_bill change `name` `name` varchar(100) character set utf8 not null ;
alter table group_bill change `contacts` `contacts` varchar(100) character set utf8 not null ;
alter table group_bill change `pickup_address` `pickup_address` varchar(200) character set utf8 not null ;
alter table group_bill change `pay_name` `pay_name` varchar(50) character set utf8 not null ;
alter table group_bill change `pay_description` `pay_description` varchar(500) character set utf8 not null ;
alter table group_bill change `description` `description` varchar(4000) character set utf8 not null ;
alter table group_bill change `flash_desc` `flash_desc` varchar(500) character set utf8 not null ;
alter table group_bill character set utf8;

alter table group_bill change `pickup_address` `pickup_address` varchar(200) character set utf8 ;
alter table group_bill change `pay_type` `pay_type` varchar(10) character set utf8 ;
alter table group_bill change `pay_count` `pay_count` varchar(50) character set utf8 ;
alter table group_bill change `pay_name` `pay_name` varchar(50) character set utf8 ;
alter table group_bill change `pay_description` `pay_description` varchar(500) character set utf8 ;
alter table group_bill change `flash_desc` `flash_desc` varchar(500) character set utf8 ;
alter table group_bill change `pickup_date` `pickup_date` TIMESTAMP;
alter table group_bill change `freight` `freight` double(3,2);
alter table group_bill add column private int  default 0;


create table cart(
    id int not null auto_increment,
    group_bill_id int not null,
    insert_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    primary key(id)
);
alter table cart add column phone varchar(11);
alter table cart add column description varchar(2000);
alter table cart add column status int not null default 0;
alter table cart add column sum int not null default 0;
alter table cart add column is_pay int default 0;
alter table cart add column freight double(7,2) not null default 0.00;
alter table cart add column lost_back double(7,2)  default 0.00;
alter table cart add column damage_back double(7,2)  default 0.00;



alter table cart change `phone` `phone` varchar(11) character set utf8 not null ;
alter table cart change `description` `description` varchar(2000) character set utf8;



create table cart_detail(
    id int not null auto_increment,
    cart_id int not null,
    bill_detail_id int not null,
    bill_detail_num int not null DEFAULT 1,
    primary key(id)
);
alter table cart_detail add column is_lost int default 0;
alter table cart_detail add column is_damage int default 0;

alter table cart_detail add column org_bill_detail_num int default 0;
alter table cart_detail add column lost_num int default 0;
alter table cart_detail add column damage_num int default 0;
alter table cart_detail add column lost_back_freight int default 0;

create table citys(
 mark varchar(15) not null,
 name varchar(60) not null,
 area varchar(30) not null,
 fristLetter varchar(5),
 sort int(11),
 qq   varchar(100),
 type int(11),
 primary key(mark)
);


create table focus(
    id int not null auto_increment,
    user_id int not null,
    material_id int not null,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    primary key(id)
);

create table black_list(
    id int not null auto_increment,
    name varchar(100) not null,
    type int not null,
    insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    primary key(id)
);
INSERT INTO black_list (name,type) VALUE('海龟',1);
INSERT INTO black_list (name,type) VALUE('玳瑁',1);
INSERT INTO black_list (name,type) VALUE('鹦鹉螺',1);
INSERT INTO black_list (name,type) VALUE('硨磲',1);


insert into citys (mark,name,area,fristLetter,sort,type) values('jj','九江','jx','J',2,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('jdz','景德镇','jx','J',3,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('px','萍乡','jx','P',4,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('xy','新余','jx','X',5,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('yt','鹰潭','jx','Y',6,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('sr','上饶','jx','S',9,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('ja','吉安','jx','J',10,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('fuz','抚州','jx','F',11,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('ganzhou','赣州','jx','G',7,2); 
insert into citys (mark,name,area,fristLetter,sort,type) values('yichun','宜春','jx','Y',8,2);