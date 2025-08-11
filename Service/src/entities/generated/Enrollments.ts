import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Courses } from "./Courses";

@Index("enrollments_student_id_course_id_key", ["courseId", "studentId"], {
  unique: true,
})
@Index("idx_enrollments_course", ["courseId"], {})
@Index("idx_enrollments_enrolled_at", ["enrolledAt"], {})
@Index("enrollments_pkey", ["id"], { unique: true })
@Index("idx_enrollments_student", ["studentId"], {})
@Entity("enrollments", { schema: "public" })
export class Enrollments {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "student_id", unique: true })
  studentId: string;

  @Column("uuid", { name: "course_id", unique: true })
  courseId: string;

  @Column("timestamp without time zone", {
    name: "enrolled_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  enrolledAt: Date;

  @Column("timestamp without time zone", {
    name: "completed_at",
    nullable: true,
  })
  completedAt: Date | null;

  @Column("integer", {
    name: "progress_percentage",
    nullable: true,
    default: () => "0",
  })
  progressPercentage: number | null;

  @Column("character varying", { name: "grade", nullable: true, length: 5 })
  grade: string | null;

  @Column("text", { name: "notes", nullable: true })
  notes: string | null;

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

  @ManyToOne(() => Courses, (courses) => courses.enrollments, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "course_id", referencedColumnName: "id" }])
  course: Courses;
}
