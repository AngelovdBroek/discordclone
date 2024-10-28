import React from 'react';

interface User {
  displayName: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bio?: string;
  banner?: string;
  effect?: string | null;
  decoration?: string | null;
}

interface CompactProfilePreviewProps {
  user: User;
}

const CompactProfilePreview: React.FC<CompactProfilePreviewProps> = ({ user }) => {
  return (
    <div className="bg-[#232428] rounded-lg overflow-hidden shadow-lg w-[280px]">
      <div className="relative h-[80px]">
        {user.banner ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${user.banner})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#5865f2]" />
        )}
        {user.effect && (
          <div className={`absolute inset-0 ${user.effect}`} />
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start">
          <div className="relative -mt-10 mr-3">
            <div className="relative">
              <img
                src={user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                alt={user.displayName}
                className="w-[60px] h-[60px] rounded-full border-[4px] border-[#232428] relative z-10"
              />
              {user.decoration && (
                <div className={`absolute inset-[-2px] rounded-full ${user.decoration} z-20`} />
              )}
            </div>
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-white text-base font-semibold">
              {user.displayName}
            </h3>
            <p className="text-[#b5bac1] text-xs">
              {user.username}#{user.discriminator}
            </p>
          </div>
        </div>

        {user.bio && (
          <div className="mt-2">
            <p className="text-[#dbdee1] text-xs line-clamp-2">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactProfilePreview;