import { Column, Entity, Index, OneToMany } from "typeorm";
import { Enrollments } from "./Enrollments";

@Index("idx_courses_category", ["category"], {})
@Index("courses_pkey", ["id"], { unique: true })
@Index("idx_courses_instructor", ["instructorId"], {})
@Index("idx_courses_featured", ["isFeatured"], {})
@Index("courses_slug_key", ["slug"], { unique: true })
@Index("idx_courses_slug", ["slug"], {})
@Entity("courses", { schema: "public" })
export class Courses {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("character varying", { name: "slug", unique: true, length: 255 })
  slug: string;

  @Column("uuid", { name: "instructor_id", nullable: true })
  instructorId: string | null;

  @Column("character varying", {
    name: "category",
    nullable: true,
    length: 100,
  })
  category: string | null;

  @Column("character varying", {
    name: "difficulty_level",
    nullable: true,
    length: 50,
    default: () => "'beginner'",
  })
  difficultyLevel: string | null;

  @Column("integer", {
    name: "duration_hours",
    nullable: true,
    default: () => "0",
  })
  durationHours: number | null;

  @Column("numeric", {
    name: "price",
    nullable: true,
    precision: 10,
    scale: 2,
    default: () => "0.00",
  })
  price: string | null;

  @Column("integer", { name: "max_students", nullable: true })
  maxStudents: number | null;

  @Column("character varying", {
    name: "thumbnail_url",
    nullable: true,
    length: 500,
  })
  thumbnailUrl: string | null;

  @Column("boolean", { name: "is_featured", default: () => "false" })
  isFeatured: boolean;

  @Column("timestamp without time zone", {
    name: "published_at",
    nullable: true,
  })
  publishedAt: Date | null;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp without time zone", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => Enrollments, (enrollments) => enrollments.course)
  enrollments: Enrollments[];
}
