import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import LinkButton from '../layout/LinkButton';
import CommentBar from '../layout/CommentBar';
import { firestore } from '../bd/FireBase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
import { useNavigate } from 'react-router-dom';

function PublicProfile() {
    const { id } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const defaultAvatar = 'https://www.promoview.com.br/uploads/images/unnamed%2819%29.png';
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();


    useEffect(() => {
        if (!id) {
            return;
        }

        const fetchUserProfile = async () => {
            const userDocRef = doc(firestore, "users", id);
            const docSnapshot = await getDoc(userDocRef);

            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                setUserProfile(userData);
            }
        };
        if (user && user.uid === id) {
            return navigate('/profile');
        }

        fetchUserProfile();
    }, [id]);


    return (
        <div className="profile-container">
            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-header">
                        <img
                            className="profile-avatar"
                            src={userProfile?.imagemUsuario ? `${userProfile.imagemUsuario}?${new Date().getTime()}` : defaultAvatar}
                            alt="Profile Avatar"
                        />
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-username">Nome: {userProfile?.nome || "N/A"}</h1>
                    </div>
                    <div className="profile-details">
                        <h2>Informações do Perfil</h2>
                        <div className="detail-row">
                            <span className="detail-label">Local:</span>
                            <span className="detail-value">{userProfile?.local || "N/A"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Aniversário:</span>
                            <span className="detail-value">{userProfile?.aniversario || "N/A"}</span>
                        </div>
                        <div className='button'>
                            <LinkButton to={`/listaPessoal/${id}`} text="ComixList" />
                        </div>
                    </div>
                </div>

                <div className="profile-description">
                    <h2>Sobre Mim</h2>
                    <p>{userProfile?.descricaoUsuario || "N/A"}</p>
                </div>

                <div className="profile-comics">
                    <h2>ComixList</h2>
                    <div className="comics-grid">
                        <div className="comics-section">
                            <h3><Link to={`/listaPessoal/${id}?tipo=completo`}>Completo</Link></h3>
                        </div>
                        <div className="comics-section">
                            <h3><Link to={`/listaPessoal/${id}?tipo=lendo`}>Lendo</Link></h3>
                        </div>
                        <div className="comics-section">
                            <h3><Link to={`/listaPessoal/${id}?tipo=dropado`}>Dropado</Link></h3>
                        </div>
                        <div className="comics-section">
                            <h3><Link to={`/listaPessoal/${id}?tipo=planejo-ler`}>Planejo Ler</Link></h3>
                        </div>
                    </div>
                </div>
            </div>
            <CommentBar />
        </div>
    );
}

export default PublicProfile;
