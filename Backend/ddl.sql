
    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;



    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;

    create table chat (
        group_chat boolean not null,
        chat_id varchar(255) not null,
        name varchar(255),
        primary key (chat_id)
    );

    create table chat_participants (
        chat_id varchar(255) not null,
        user_id varchar(255) not null
    );

    create table messages (
        delivered boolean,
        timestamp timestamp(6),
        chat_id varchar(255) not null,
        content varchar(255) not null,
        id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table users (
        password varchar(255),
        userid varchar(255) not null,
        username varchar(255) not null unique,
        primary key (userid)
    );

    alter table if exists chat_participants 
       add constraint FKbhdyxo0ndtbs1t49l28y21rkw 
       foreign key (user_id) 
       references users;

    alter table if exists chat_participants 
       add constraint FK44t5cpu2fejyqk36kb8pico4u 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FKdumcu11xf8ldun8i4xpd04j43 
       foreign key (chat_id) 
       references chat;

    alter table if exists messages 
       add constraint FK4ui4nnwntodh6wjvck53dbk9m 
       foreign key (sender_id) 
       references users;
