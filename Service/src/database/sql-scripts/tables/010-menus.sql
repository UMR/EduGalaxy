create table menus (
	id uuid primary key default gen_random_uuid(),
	title varchar(50) not null,
    description varchar(200) null,
	parent_id uuid null,
	route varchar(200) null,
	permission_id uuid null,
	sort_order int null default 1,
	is_active bool not null default true,
	created_by uuid not null,
	created_at timestamptz not null default current_timestamp,
	updated_by uuid null,
	updated_at timestamptz null,
	constraint fk_menu_user_created
		foreign key (created_by)
		references users(id),
	constraint fk_menu_user_updated
		foreign key (updated_by)
		references users(id),
	constraint fk_menu_menu_parent
	    foreign key (parent_id)
		references menus(id)
)