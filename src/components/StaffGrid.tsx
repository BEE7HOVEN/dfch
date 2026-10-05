// 섬기는 분들 페이지의 교역자·장로 사진 카드 묶음 (사진이 없으면 빈 자리 그림)
import Image from "next/image";
import { staffGroups, type StaffMember } from "@/lib/staff";

function Portrait({ member }: { member: StaffMember }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-mist">
      {member.photo ? (
        <Image
          src={member.photo}
          alt={`${member.role} ${member.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 300px"
        />
      ) : (
        <svg
          viewBox="0 0 100 125"
          className="absolute inset-0 w-full h-full text-forest/25"
          fill="currentColor"
          role="img"
          aria-label={`${member.role} ${member.name} 사진 준비 중`}
        >
          <circle cx="50" cy="50" r="19" />
          <path d="M14 125c0-26 16-44 36-44s36 18 36 44z" />
        </svg>
      )}
    </div>
  );
}

export default function StaffGrid() {
  return (
    <div className="space-y-14 md:space-y-20">
      {staffGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-[22px] md:text-[26px] font-bold text-ink">{group.title}</h3>
          <ul className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {group.members.map((m) => (
              <li key={`${m.role}-${m.name}`}>
                <Portrait member={m} />
                <p className="mt-4 text-sm font-semibold text-forest">{m.role}</p>
                <p className="mt-1 text-xl font-bold text-ink">{m.name}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
