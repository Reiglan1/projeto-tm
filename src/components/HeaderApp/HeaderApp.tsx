export default function HeaderApp() {
  return (
    <header className="flex items-center justify-between px-10 py-[18px] bg-white border-b border-[#e8eef6] sticky top-0 z-50 font-sans">

      {/* Logo */}
      <div className="text-[22px] font-black tracking-tight text-[#0a0a0a]">
        servi<span className="text-[#1a6dff]">já</span>
      </div>

      {/* Links de navegação */}
      <nav>
        <ul className="flex gap-7 list-none m-0 p-0">
          {["Como funciona", "Serviços", "Profissionais", "Segurança", "Sobre nós"].map((item) => (
            <li key={item}>
              
                <a href="#"
                className="text-[#555555] no-underline text-lg font-normal hover:text-[#1a6dff] transition-colors duration-150"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botões de ação */}
      <div className="flex gap-2.5 items-center">
        <button className="bg-transparent border border-[#d0dce8] text-[#1a6dff] px-5 py-2.5 rounded-full text-[13px] font-medium cursor-pointer hover:bg-[#eef4ff] transition-colors duration-150">
          Entrar
        </button>
        <button className="bg-[#1a6dff] border-none text-white px-[22px] py-2.5 rounded-full text-[13px] font-semibold cursor-pointer hover:bg-[#0052d4] transition-colors duration-150">
          Cadastrar
        </button>
      </div>

    </header>
  );
}